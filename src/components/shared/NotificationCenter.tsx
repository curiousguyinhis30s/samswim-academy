'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Notification, getDb } from '@/lib/db'

interface NotificationCenterProps {
  userId: number
}

// Notification type icons mapping
const notificationIcons: Record<Notification['notificationType'], { icon: string; bgColor: string; color: string }> = {
  lesson_reminder: {
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    bgColor: 'bg-teal-100',
    color: 'text-teal-600',
  },
  badge_earned: {
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    bgColor: 'bg-amber-100',
    color: 'text-amber-600',
  },
  goal_completed: {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    bgColor: 'bg-emerald-100',
    color: 'text-emerald-600',
  },
  feedback: {
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    bgColor: 'bg-blue-100',
    color: 'text-blue-600',
  },
  streak: {
    icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
    bgColor: 'bg-orange-100',
    color: 'text-orange-600',
  },
  system: {
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    bgColor: 'bg-slate-100',
    color: 'text-slate-600',
  },
}

// Format relative time
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) {
    return 'Yesterday'
  }

  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  }

  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date))
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const database = await getDb()
      const userNotifications = await database.notifications
        .where('userId')
        .equals(userId)
        .reverse()
        .sortBy('createdAt')
      setNotifications(userNotifications)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Mark single notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      const database = await getDb()
      await database.notifications.update(notificationId, {
        isRead: true,
        readAt: new Date(),
      })
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
        )
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const database = await getDb()
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id!)

      for (const id of unreadIds) {
        await database.notifications.update(id, {
          isRead: true,
          readAt: new Date(),
        })
      }

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      )
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      const database = await getDb()
      await database.notifications.delete(notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id!)
    }

    if (notification.actionUrl) {
      // Navigate to related content
      window.location.href = notification.actionUrl
    }

    setIsOpen(false)
  }

  const getNotificationIcon = (type: Notification['notificationType']) => {
    const config = notificationIcons[type]
    return (
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
        <svg
          className={`w-5 h-5 ${config.color}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-turquoise-500 rounded-full shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-slideDown"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-teal-500 to-turquoise-500 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm font-medium text-teal-100 hover:text-white transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-teal-100 mt-0.5">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
                <p className="mt-3 text-sm text-slate-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-teal-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <h4 className="text-slate-900 font-semibold mb-1">All caught up!</h4>
                <p className="text-sm text-slate-500 max-w-[200px]">
                  No new notifications. Check back later for updates on your swimming journey.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`group relative px-4 py-3 flex gap-3 cursor-pointer transition-all duration-200 hover:bg-teal-50/50 ${
                      !notification.isRead ? 'bg-teal-50/30' : ''
                    }`}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleNotificationClick(notification)
                      }
                    }}
                  >
                    {/* Priority Indicator */}
                    {notification.priority === 'high' && (
                      <div className="absolute top-3 left-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}

                    {/* Icon */}
                    {getNotificationIcon(notification.notificationType)}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`text-sm font-medium ${
                            !notification.isRead ? 'text-slate-900' : 'text-slate-700'
                          } line-clamp-1`}
                        >
                          {notification.title}
                        </h4>
                        <span className="flex-shrink-0 text-xs text-slate-400">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Action URL indicator */}
                      {notification.actionUrl && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-teal-600 font-medium">
                          <span>View details</span>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => deleteNotification(notification.id!, e)}
                      className="flex-shrink-0 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Delete notification"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-teal-500 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Navigate to full notifications page if available
                  window.location.href = '/notifications'
                }}
                className="w-full text-center text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default NotificationCenter
