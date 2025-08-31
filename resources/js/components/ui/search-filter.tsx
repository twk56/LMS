import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface FilterOption {
    value: string;
    label: string;
}

interface SearchFilterProps {
    onSearch: (query: string) => void;
    onFilter: (filters: Record<string, string>) => void;
    placeholder?: string;
    filters?: FilterOption[];
    className?: string;
}

export function SearchFilter({ 
    onSearch, 
    onFilter, 
    placeholder = "ค้นหา...", 
    filters = [],
    className 
}: SearchFilterProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        onSearch(query);
    }, [onSearch]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        const newFilters = { ...activeFilters };
        if (value) {
            newFilters[key] = value;
        } else {
            delete newFilters[key];
        }
        setActiveFilters(newFilters);
        onFilter(newFilters);
    }, [activeFilters, onFilter]);

    const clearFilters = useCallback(() => {
        setActiveFilters({});
        onFilter({});
    }, [onFilter]);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
        onSearch('');
    }, [onSearch]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, handleSearch]);

    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    return (
        <div className={cn('space-y-4', className)}>
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-10"
                />
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>

            {/* Filter Section */}
            {filters.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            ตัวกรอง
                            {hasActiveFilters && (
                                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                    {Object.keys(activeFilters).length}
                                </span>
                            )}
                        </Button>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                ล้างตัวกรอง
                            </Button>
                        )}
                    </div>

                    {isFilterOpen && (
                        <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg bg-muted/50">
                            {filters.map((filter) => (
                                <div key={filter.value} className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">
                                        {filter.label}
                                    </label>
                                    <Input
                                        placeholder={`กรอก ${filter.label.toLowerCase()}...`}
                                        value={activeFilters[filter.value] || ''}
                                        onChange={(e) => handleFilterChange(filter.value, e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(activeFilters).map(([key, value]) => {
                        const filter = filters.find(f => f.value === key);
                        return (
                            <div
                                key={key}
                                className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                            >
                                <span>{filter?.label}: {value}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFilterChange(key, '')}
                                    className="h-4 w-4 p-0 hover:bg-primary/20"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
