import React, { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import { IPDRSession } from '@/types/ipdr';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface CSVUploaderProps {
  onDataLoaded: (sessions: IPDRSession[]) => void;
  isLoading?: boolean;
}

export function CSVUploader({ onDataLoaded, isLoading = false }: CSVUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatus('parsing');
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const sessions: IPDRSession[] = results.data.map((row: any, index: number) => ({
            session_id: row.session_id || `session-${index}`,
            protocol: row.protocol || 'SIP',
            duration: parseFloat(row.duration) || 0,
            bytes: parseFloat(row.bytes) || 0,
            timestamp: row.timestamp || new Date().toISOString(),
            src: {
              node_id: row.src_node_id || `src-${index}`,
              ip: row.src_ip || '192.168.1.1',
              port: parseInt(row.src_port) || 5060,
              phone: parseInt(row.src_phone) || 0,
              tower_lat: parseFloat(row.src_tower_lat) || 28.6139,
              tower_lon: parseFloat(row.src_tower_lon) || 77.209,
            },
            des: {
              node_id: row.des_node_id || `des-${index}`,
              ip: row.des_ip || '192.168.1.2',
              port: parseInt(row.des_port) || 5060,
              phone: parseInt(row.des_phone) || 0,
              tower_lat: parseFloat(row.des_tower_lat) || 28.6139,
              tower_lon: parseFloat(row.des_tower_lon) || 77.209,
            },
          }));

          setStatus('success');
          onDataLoaded(sessions);
        } catch (err) {
          setStatus('error');
          setError('Failed to parse CSV data. Please check the format.');
        }
      },
      error: () => {
        setStatus('error');
        setError('Failed to read the CSV file.');
      },
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'parsing':
        return <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Upload className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'parsing':
        return 'Parsing CSV...';
      case 'success':
        return `Loaded: ${fileName}`;
      case 'error':
        return error;
      default:
        return 'Upload IPDR CSV';
    }
  };

  return (
    <div className="intel-panel">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-sm">Data Import</h3>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleUploadClick}
          disabled={isLoading || status === 'parsing'}
          className="w-full intel-button flex items-center gap-2"
          variant={status === 'error' ? 'destructive' : 'default'}
        >
          {getStatusIcon()}
          <span className="text-xs">{getStatusText()}</span>
        </Button>
      </motion.div>

      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-md"
        >
          <p className="text-xs text-green-400">CSV data loaded successfully</p>
        </motion.div>
      )}

      <div className="mt-4 text-xs text-muted-foreground">
        <p className="mb-2">Expected CSV columns:</p>
        <ul className="space-y-1 text-xs">
          <li>• session_id, protocol, duration, bytes</li>
          <li>• src_ip, src_port, src_phone, src_tower_lat, src_tower_lon</li>
          <li>• des_ip, des_port, des_phone, des_tower_lat, des_tower_lon</li>
        </ul>
      </div>
    </div>
  );
}