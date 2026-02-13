import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { Eye, Edit, Ban, Trash2, X } from 'lucide-react';
import type { User } from '../store/users';
import '../Styles/useractionspopup.css';

interface UserActionsPopupProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  position?: { top: number; left: number };
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onSuspend?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export default function UserActionsPopup({
  user,
  isOpen,
  onClose,
  position,
  onView,
  onEdit,
  onSuspend,
  onDelete,
}: UserActionsPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !position || !popupRef.current) return;

    const popup = popupRef.current;
    const popupRect = popup.getBoundingClientRect();
    // const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate position, ensuring popup stays within viewport
    let left = position.left - popupRect.width;
    let top = position.top;

    // Adjust if popup would go off-screen
    if (left < 0) {
      left = position.left;
    }
    if (top + popupRect.height > viewportHeight) {
      top = position.top - popupRect.height - 4;
    }

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
  }, [isOpen, position]);

  if (!isOpen) return null;

  const popupContent = (
    <div className="user-actions-popup-overlay" onClick={onClose}>
      <div
        ref={popupRef}
        className="user-actions-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup-header">
          <span className="popup-title">Actions</span>
          <button className="popup-close-button" onClick={onClose} aria-label="Close">
            <X className="popup-close-icon" />
          </button>
        </div>
        <div className="popup-content">
          {onView && (
            <button
              className="popup-action-item"
              onClick={() => {
                onView(user);
                onClose();
              }}
            >
              <Eye className="action-icon" />
              <span>View Details</span>
            </button>
          )}
          {onEdit && (
            <button
              className="popup-action-item"
              onClick={() => {
                onEdit(user);
                onClose();
              }}
            >
              <Edit className="action-icon" />
              <span>Edit User</span>
            </button>
          )}
          {onSuspend && (
            <button
              className="popup-action-item popup-action-warning"
              onClick={() => {
                onSuspend(user);
                onClose();
              }}
            >
              <Ban className="action-icon" />
              <span>
                {user.status === 'Suspended' ? 'Unsuspend User' : 'Suspend User'}
              </span>
            </button>
          )}
          {onDelete && (
            <button
              className="popup-action-item popup-action-danger"
              onClick={() => {
                onDelete(user);
                onClose();
              }}
            >
              <Trash2 className="action-icon" />
              <span>Delete User</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(popupContent, document.body);
}
