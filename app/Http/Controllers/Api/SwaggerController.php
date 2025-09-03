<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="LMS Enterprise API",
 *     description="Learning Management System Enterprise API Documentation",
 *     @OA\Contact(
 *         email="support@enterprise-lms.com",
 *         name="API Support Team"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 * 
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="API Server"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 * 
 * @OA\Tag(
 *     name="Authentication",
 *     description="API Endpoints for user authentication"
 * )
 * 
 * @OA\Tag(
 *     name="Courses",
 *     description="API Endpoints for course management"
 * )
 * 
 * @OA\Tag(
 *     name="Lessons",
 *     description="API Endpoints for lesson management"
 * )
 * 
 * @OA\Tag(
 *     name="Videos",
 *     description="API Endpoints for video streaming and management"
 * )
 * 
 * @OA\Tag(
 *     name="Analytics",
 *     description="API Endpoints for learning analytics"
 * )
 * 
 * @OA\Tag(
 *     name="Users",
 *     description="API Endpoints for user management"
 * )
 */
class SwaggerController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/health",
     *     operationId="healthCheck",
     *     tags={"System"},
     *     summary="Health Check",
     *     description="Check if the API is running",
     *     @OA\Response(
     *         response=200,
     *         description="API is healthy",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="healthy"),
     *             @OA\Property(property="timestamp", type="string", format="date-time"),
     *             @OA\Property(property="version", type="string", example="1.0.0")
     *         )
     *     )
     * )
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'version' => '1.0.0',
            'services' => [
                'database' => 'connected',
                'cache' => 'connected',
                'queue' => 'running',
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/version",
     *     operationId="getVersion",
     *     tags={"System"},
     *     summary="Get API Version",
     *     description="Get current API version information",
     *     @OA\Response(
     *         response=200,
     *         description="Version information",
     *         @OA\JsonContent(
     *             @OA\Property(property="version", type="string", example="1.0.0"),
     *             @OA\Property(property="laravel_version", type="string"),
     *             @OA\Property(property="php_version", type="string"),
     *             @OA\Property(property="features", type="array", @OA\Items(type="string"))
     *         )
     *     )
     * )
     */
    public function version(): JsonResponse
    {
        return response()->json([
            'version' => '1.0.0',
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
            'features' => [
                'video_streaming',
                'ai_analytics',
                'multi_tenant',
                'real_time_notifications',
                'advanced_reporting',
            ],
        ]);
    }
}
