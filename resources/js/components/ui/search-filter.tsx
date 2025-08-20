import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface FilterOption {
    id: string;
    label: string;
    value: string;
}

interface SearchFilterProps {
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    filters?: {
        id: string;
        label: string;
        type: 'select' | 'checkbox' | 'date';
        options?: FilterOption[];
        value?: any;
        onChange?: (value: any) => void;
    }[];
    onFiltersChange?: (filters: Record<string, any>) => void;
    onClearFilters?: () => void;
    className?: string;
}

export function SearchFilter({
    searchPlaceholder = 'ค้นหา...',
    searchValue = '',
    onSearchChange,
    filters = [],
    onFiltersChange,
    onClearFilters,
    className = ''
}: SearchFilterProps) {
    const [localSearchValue, setLocalSearchValue] = useState(searchValue);
    const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        setLocalSearchValue(searchValue);
    }, [searchValue]);

    useEffect(() => {
        // Initialize local filters from props
        const initialFilters: Record<string, any> = {};
        filters.forEach(filter => {
            if (filter.value !== undefined) {
                initialFilters[filter.id] = filter.value;
            }
        });
        setLocalFilters(initialFilters);
    }, [filters]);

    const handleSearchChange = (value: string) => {
        setLocalSearchValue(value);
        onSearchChange?.(value);
    };

    const handleFilterChange = (filterId: string, value: any) => {
        const newFilters = { ...localFilters, [filterId]: value };
        setLocalFilters(newFilters);
        onFiltersChange?.(newFilters);
    };

    const handleClearFilters = () => {
        setLocalFilters({});
        onClearFilters?.();
    };

    const hasActiveFilters = Object.values(localFilters).some(value => 
        value !== undefined && value !== '' && 
        (Array.isArray(value) ? value.length > 0 : true)
    );

    const activeFilterCount = Object.values(localFilters).filter(value => 
        value !== undefined && value !== '' && 
        (Array.isArray(value) ? value.length > 0 : true)
    ).length;

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    className="pl-10"
                    value={localSearchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>

            {/* Filters */}
            {filters.length > 0 && (
                <div className="flex items-center gap-2">
                    <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                ตัวกรอง
                                {activeFilterCount > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {activeFilterCount}
                                    </Badge>
                                )}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">ตัวกรอง</h4>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearFilters}
                                        >
                                            <X className="mr-1 h-3 w-3" />
                                            ล้าง
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {filters.map((filter) => (
                                        <div key={filter.id} className="space-y-2">
                                            <Label>{filter.label}</Label>
                                            
                                            {filter.type === 'select' && (
                                                <Select
                                                    value={localFilters[filter.id] || ''}
                                                    onValueChange={(value) => handleFilterChange(filter.id, value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="เลือกตัวเลือก" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="">ทั้งหมด</SelectItem>
                                                        {filter.options?.map((option) => (
                                                            <SelectItem key={option.id} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}

                                            {filter.type === 'checkbox' && (
                                                <div className="space-y-2">
                                                    {filter.options?.map((option) => (
                                                        <div key={option.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`${filter.id}-${option.id}`}
                                                                checked={
                                                                    Array.isArray(localFilters[filter.id])
                                                                        ? localFilters[filter.id]?.includes(option.value)
                                                                        : localFilters[filter.id] === option.value
                                                                }
                                                                onCheckedChange={(checked) => {
                                                                    if (Array.isArray(localFilters[filter.id])) {
                                                                        const currentValues = localFilters[filter.id] || [];
                                                                        const newValues = checked
                                                                            ? [...currentValues, option.value]
                                                                            : currentValues.filter(v => v !== option.value);
                                                                        handleFilterChange(filter.id, newValues);
                                                                    } else {
                                                                        handleFilterChange(filter.id, checked ? option.value : '');
                                                                    }
                                                                }}
                                                            />
                                                            <Label htmlFor={`${filter.id}-${option.id}`}>
                                                                {option.label}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {filter.type === 'date' && (
                                                <Input
                                                    type="date"
                                                    value={localFilters[filter.id] || ''}
                                                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Active Filter Tags */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2">
                            {filters.map((filter) => {
                                const value = localFilters[filter.id];
                                if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
                                    return null;
                                }

                                let displayValue = value;
                                if (Array.isArray(value)) {
                                    displayValue = value.join(', ');
                                } else if (filter.type === 'select' && filter.options) {
                                    const option = filter.options.find(opt => opt.value === value);
                                    displayValue = option?.label || value;
                                }

                                return (
                                    <Badge key={filter.id} variant="secondary" className="gap-1">
                                        {filter.label}: {displayValue}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 ml-1"
                                            onClick={() => handleFilterChange(filter.id, 
                                                Array.isArray(value) ? [] : ''
                                            )}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Advanced Search Component
interface AdvancedSearchProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    filters: Record<string, any>;
    onFiltersChange: (filters: Record<string, any>) => void;
    searchFields: {
        id: string;
        label: string;
        placeholder?: string;
    }[];
    filterFields: {
        id: string;
        label: string;
        type: 'select' | 'checkbox' | 'date' | 'range';
        options?: FilterOption[];
    }[];
}

export function AdvancedSearch({
    searchValue,
    onSearchChange,
    filters,
    onFiltersChange,
    searchFields,
    filterFields
}: AdvancedSearchProps) {
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    const handleFilterChange = (filterId: string, value: any) => {
        onFiltersChange({ ...filters, [filterId]: value });
    };

    const clearAllFilters = () => {
        const clearedFilters: Record<string, any> = {};
        filterFields.forEach(field => {
            clearedFilters[field.id] = field.type === 'checkbox' ? [] : '';
        });
        onFiltersChange(clearedFilters);
    };

    return (
        <div className="space-y-4">
            {/* Basic Search */}
            <div className="flex gap-2">
                <div className="flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาขั้นสูง..."
                        className="pl-10"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                >
                    <Filter className="mr-2 h-4 w-4" />
                    ตัวกรองขั้นสูง
                </Button>
            </div>

            {/* Advanced Filters */}
            {isAdvancedOpen && (
                <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">ตัวกรองขั้นสูง</h4>
                        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                            ล้างทั้งหมด
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filterFields.map((field) => (
                            <div key={field.id} className="space-y-2">
                                <Label>{field.label}</Label>
                                
                                {field.type === 'select' && (
                                    <Select
                                        value={filters[field.id] || ''}
                                        onValueChange={(value) => handleFilterChange(field.id, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกตัวเลือก" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">ทั้งหมด</SelectItem>
                                            {field.options?.map((option) => (
                                                <SelectItem key={option.id} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {field.type === 'checkbox' && (
                                    <div className="space-y-2">
                                        {field.options?.map((option) => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`${field.id}-${option.id}`}
                                                    checked={filters[field.id]?.includes(option.value) || false}
                                                    onCheckedChange={(checked) => {
                                                        const currentValues = filters[field.id] || [];
                                                        const newValues = checked
                                                            ? [...currentValues, option.value]
                                                            : currentValues.filter(v => v !== option.value);
                                                        handleFilterChange(field.id, newValues);
                                                    }}
                                                />
                                                <Label htmlFor={`${field.id}-${option.id}`}>
                                                    {option.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {field.type === 'date' && (
                                    <Input
                                        type="date"
                                        value={filters[field.id] || ''}
                                        onChange={(e) => handleFilterChange(field.id, e.target.value)}
                                    />
                                )}

                                {field.type === 'range' && (
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="ต่ำสุด"
                                            value={filters[`${field.id}_min`] || ''}
                                            onChange={(e) => handleFilterChange(`${field.id}_min`, e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="สูงสุด"
                                            value={filters[`${field.id}_max`] || ''}
                                            onChange={(e) => handleFilterChange(`${field.id}_max`, e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
