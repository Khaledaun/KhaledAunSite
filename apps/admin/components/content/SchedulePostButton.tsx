'use client';

import { useState } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';

interface SchedulePostButtonProps {
  contentId: string;
  currentSchedule?: string | null;
  onScheduled?: (scheduledFor: string) => void;
  onCancelled?: () => void;
  onError?: (error: string) => void;
}

export function SchedulePostButton({
  contentId,
  currentSchedule,
  onScheduled,
  onCancelled,
  onError,
}: SchedulePostButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Format date for input (YYYY-MM-DDTHH:MM)
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Default to 1 hour from now
    now.setMinutes(0);
    return now.toISOString().slice(0, 16);
  };

  const [scheduledFor, setScheduledFor] = useState(
    currentSchedule
      ? new Date(currentSchedule).toISOString().slice(0, 16)
      : getDefaultDateTime()
  );

  const handleSchedule = async () => {
    setScheduling(true);
    setResult(null);

    try {
      const response = await fetch('/api/linkedin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          scheduledFor: new Date(scheduledFor).toISOString(),
          targets: ['linkedin'],
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: 'Post scheduled successfully!',
        });
        onScheduled?.(data.scheduledFor);
        setTimeout(() => {
          setShowModal(false);
          setResult(null);
        }, 2000);
      } else {
        const errorMsg = data.details || data.error || 'Failed to schedule';
        setResult({
          success: false,
          message: errorMsg,
        });
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setResult({
        success: false,
        message: errorMsg,
      });
      onError?.(errorMsg);
    } finally {
      setScheduling(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this scheduled post?')) {
      return;
    }

    setCancelling(true);

    try {
      const response = await fetch('/api/linkedin/schedule', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onCancelled?.();
      } else {
        const errorMsg = data.details || data.error || 'Failed to cancel';
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      onError?.(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      {/* Schedule Button or Current Schedule */}
      {currentSchedule ? (
        <div className="space-y-2">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Scheduled</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-sm text-yellow-700 hover:text-yellow-800 underline"
              >
                Edit
              </button>
            </div>
            <p className="text-sm text-yellow-700">
              {new Date(currentSchedule).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full px-4 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Schedule'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 border border-blue-300 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Calendar className="h-5 w-5" />
          Schedule on LinkedIn
        </button>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Schedule LinkedIn Post
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule For
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Post will be published automatically at the scheduled time.
                </p>
              </div>

              {/* Result Message */}
              {result && (
                <div
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <p
                      className={`text-sm ${
                        result.success ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {result.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={scheduling || !scheduledFor}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scheduling ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

