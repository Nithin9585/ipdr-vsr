import * as React from 'react';
import { Search, Filter, Calendar, Database, Clock, Wifi, ToggleLeft, ToggleRight } from 'lucide-react';
import { FilterState } from '@/types/ipdr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalSessions: number;
  filteredCount: number;
}

export function FilterPanel({ filters, onFiltersChange, totalSessions, filteredCount }: FilterPanelProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      protocol: '',
      minBytes: 0,
      maxBytes: 999999999,
      minDuration: 0,
      maxDuration: 99999,
      startDate: '',
      endDate: '',
      showAnomaliesOnly: false,
    });
  };

  return (
    <div className="intel-panel space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Filters</h3>
        </div>
        <Button
          onClick={resetFilters}
          variant="ghost"
          size="sm"
          className="text-xs h-6 px-2"
        >
          Reset
        </Button>
      </div>

      {/* Results Count */}
      <motion.div
        key={filteredCount}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="p-2 bg-primary/10 rounded-md"
      >
        <p className="text-xs text-primary font-mono">
          {filteredCount} / {totalSessions} sessions
        </p>
      </motion.div>

      {/* Search */}
      <div className="space-y-2">
        <label className="text-xs font-medium flex items-center gap-1">
          <Search className="w-3 h-3" />
          Search
        </label>
        <Input
          placeholder="IP, phone, session ID..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="intel-search text-xs h-8"
        />
      </div>

      {/* Protocol Filter */}
      <div className="space-y-2">
        <label className="text-xs font-medium flex items-center gap-1">
          <Wifi className="w-3 h-3" />
          Protocol
        </label>
        <Select value={filters.protocol === '' ? 'all' : filters.protocol} onValueChange={(value) => updateFilter('protocol', value === 'all' ? '' : value)}>
          <SelectTrigger className="intel-search h-8 text-xs">
            <SelectValue placeholder="All protocols" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All protocols</SelectItem>
            <SelectItem value="SIP">SIP</SelectItem>
            <SelectItem value="RTP">RTP</SelectItem>
            <SelectItem value="HTTP">HTTP</SelectItem>
            <SelectItem value="HTTPS">HTTPS</SelectItem>
            <SelectItem value="TCP">TCP</SelectItem>
          </SelectContent>
        </Select>
      </div>

    



      {/* Date Range */}
      <div className="space-y-2">
        <label className="text-xs font-medium flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => updateFilter('startDate', e.target.value)}
            className="intel-search text-xs h-8"
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => updateFilter('endDate', e.target.value)}
            className="intel-search text-xs h-8"
          />
        </div>
      </div>

      {/* Bytes Range */}
      <div className="space-y-2">
        <label className="text-xs font-medium flex items-center gap-1">
          <Database className="w-3 h-3" />
          Bytes (MB)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minBytes === 0 ? '' : filters.minBytes}
            onChange={(e) => updateFilter('minBytes', parseInt(e.target.value) || 0)}
            className="intel-search text-xs h-8"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxBytes === 999999999 ? '' : filters.maxBytes}
            onChange={(e) => updateFilter('maxBytes', parseInt(e.target.value) || 999999999)}
            className="intel-search text-xs h-8"
          />
        </div>
      </div>

      {/* Duration Range */}
      <div className="space-y-2">
        <label className="text-xs font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Duration (sec)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minDuration === 0 ? '' : filters.minDuration}
            onChange={(e) => updateFilter('minDuration', parseInt(e.target.value) || 0)}
            className="intel-search text-xs h-8"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxDuration === 99999 ? '' : filters.maxDuration}
            onChange={(e) => updateFilter('maxDuration', parseInt(e.target.value) || 99999)}
            className="intel-search text-xs h-8"
          />
        </div>
      </div>

      {/* Anomalies Only Toggle */}
      <div className="space-y-2">
        <Button
          onClick={() => updateFilter('showAnomaliesOnly', !filters.showAnomaliesOnly)}
          variant="ghost"
          className="w-full justify-start p-2 h-auto text-xs"
        >
          <div className="flex items-center gap-2">
            {filters.showAnomaliesOnly ?
              <ToggleRight className="w-4 h-4 text-red-500" /> :
              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
            }
            <span className={filters.showAnomaliesOnly ? 'text-red-400 font-medium' : ''}>
              Show Anomalies Only
            </span>
          </div>
        </Button>
      </div>

      {/* Active Filters Summary */}
      {(filters.search || filters.protocol || filters.showAnomaliesOnly) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-2 border-t border-border"
        >
          <p className="text-xs text-muted-foreground mb-2">Active filters:</p>
          <div className="space-y-1">
            {filters.search && (
              <div className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                Search: "{filters.search}"
              </div>
            )}
            {filters.protocol && (
              <div className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                Protocol: {filters.protocol}
              </div>
            )}
            {filters.showAnomaliesOnly && (
              <div className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                Anomalies Only
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}