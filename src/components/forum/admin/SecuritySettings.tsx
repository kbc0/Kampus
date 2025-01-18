import React, { useState, useEffect } from 'react';
import { Shield, Eye, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '../../common/Card';
import { Select } from '../../common/Select';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

export const SecuritySettings = () => {
  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_audit_log')
        .select(`
          *,
          moderator:profiles!action_by(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Security Policies"
          icon={Shield}
          description="Configure system-wide security settings"
        >
          <form className="space-y-4">
            <Select
              label="Password Policy"
              value="strong"
              onChange={() => {}}
              options={[
                { value: 'basic', label: 'Basic (8+ characters)' },
                { value: 'medium', label: 'Medium (8+ chars, 1 number)' },
                { value: 'strong', label: 'Strong (8+ chars, number, special)' }
              ]}
            />

            <Select
              label="Session Timeout"
              value="24h"
              onChange={() => {}}
              options={[
                { value: '1h', label: '1 hour' },
                { value: '8h', label: '8 hours' },
                { value: '24h', label: '24 hours' },
                { value: '7d', label: '7 days' }
              ]}
            />

            <Input
              label="Maximum Login Attempts"
              type="number"
              value="5"
              onChange={() => {}}
            />

            <Button type="submit" isLoading={loading}>
              Save Settings
            </Button>
          </form>
        </Card>

        <Card
          title="Recent Activity"
          icon={Eye}
          description="Latest security events and alerts"
        >
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start space-x-3 p-3 rounded-lg bg-gray-700/50"
              >
                <div className="flex-shrink-0">
                  {log.action_type.includes('ban') ? (
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  ) : (
                    <Clock className="h-5 w-5 text-violet-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span className="font-medium">{log.moderator?.name}</span>
                    {' '}
                    {log.action_type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};