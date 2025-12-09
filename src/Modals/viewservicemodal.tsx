import { X } from 'lucide-react';
import { useViewServiceModalStore } from '../store/createservice';
import '../Styles/servicemodal.css';

const ViewServiceModal = () => {
    const { isOpen, closeViewServiceModal } = useViewServiceModalStore();

    if (!isOpen) return null; console.log('Modal is closed');


    return (
        <div className="modal-overlay" onClick={closeViewServiceModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">View Service</h2>
                    <button className="modal-close-button" onClick={closeViewServiceModal}>
                        <X className="close-icon" />
                    </button>
                </div>
                <div className="modal-form">
                    {/* Service details will go here */}
                    <p>Service details...</p>
                </div>
            </div>
        </div>
    );
};

export default ViewServiceModal;