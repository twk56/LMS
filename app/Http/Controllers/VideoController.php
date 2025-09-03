<?php

namespace App\Http\Controllers;

use App\Services\VideoService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

/**
 * @OA\Tag(
 *     name="Videos",
 *     description="Video streaming and management endpoints"
 * )
 */

class VideoController extends Controller
{
    protected VideoService $videoService;

    public function __construct(VideoService $videoService)
    {
        $this->videoService = $videoService;
    }

    /**
     * Display video upload form
     */
    public function create(): Response
    {
        return Inertia::render('Videos/Create');
    }

    /**
     * @OA\Post(
     *     path="/api/videos",
     *     operationId="uploadVideo",
     *     tags={"Videos"},
     *     summary="Upload video",
     *     description="Upload a new video file to S3 and start transcoding",
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="video", type="string", format="binary", description="Video file"),
     *                 @OA\Property(property="title", type="string", maxLength=255, description="Video title"),
     *                 @OA\Property(property="description", type="string", maxLength=1000, description="Video description"),
     *                 @OA\Property(property="course_id", type="integer", description="Associated course ID"),
     *                 @OA\Property(property="lesson_id", type="integer", description="Associated lesson ID")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Video uploaded successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="upload", type="object"),
     *                 @OA\Property(property="transcode_job_id", type="string", nullable=true),
     *                 @OA\Property(property="signed_url", type="string")
     *             ),
     *             @OA\Property(property="message", type="string", example="Video uploaded successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     * 
     * Upload video
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'video' => 'required|file|mimes:mp4,avi,mov,wmv,flv,webm|max:102400', // 100GB max
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'course_id' => 'nullable|exists:courses,id',
            'lesson_id' => 'nullable|exists:lessons,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $videoFile = $request->file('video');
            $uploadResult = $this->videoService->uploadVideo($videoFile, 'videos');

            // Start transcoding if MediaConvert is configured
            $transcodeJobId = null;
            if (config('aws.media_convert.endpoint')) {
                $transcodeJobId = $this->videoService->transcodeVideo($uploadResult['key']);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'upload' => $uploadResult,
                    'transcode_job_id' => $transcodeJobId,
                    'signed_url' => $this->videoService->generateSignedUrl($uploadResult['key']),
                ],
                'message' => 'Video uploaded successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload video: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get video stream URL
     */
    public function stream(Request $request, string $key): JsonResponse
    {
        try {
            $signedUrl = $this->videoService->generateSignedUrl($key);
            $metadata = $this->videoService->getVideoMetadata($key);

            return response()->json([
                'success' => true,
                'data' => [
                    'stream_url' => $signedUrl,
                    'metadata' => $metadata,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate stream URL: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get video metadata
     */
    public function metadata(string $key): JsonResponse
    {
        try {
            $metadata = $this->videoService->getVideoMetadata($key);

            return response()->json([
                'success' => true,
                'data' => $metadata,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get video metadata: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete video
     */
    public function destroy(string $key): JsonResponse
    {
        try {
            $deleted = $this->videoService->deleteVideo($key);

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Video deleted successfully',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete video',
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete video: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get transcoding status
     */
    public function transcodingStatus(string $jobId): JsonResponse
    {
        try {
            if (!config('aws.media_convert.endpoint')) {
                return response()->json([
                    'success' => false,
                    'message' => 'MediaConvert not configured',
                ], 400);
            }

            // This would typically query MediaConvert for job status
            // For now, return a placeholder response
            return response()->json([
                'success' => true,
                'data' => [
                    'job_id' => $jobId,
                    'status' => 'IN_PROGRESS', // This would be dynamic
                    'progress' => 50, // This would be dynamic
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get transcoding status: ' . $e->getMessage(),
            ], 500);
        }
    }
}
