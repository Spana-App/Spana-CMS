import { useState } from 'react';
import { Search, Flag, Eye, Trash2, Star } from 'lucide-react';
import '../Styles/reviewsdisputes.css';

interface Review {
  id: number;
  client: string;
  provider: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
  flagged: boolean;
}

interface Dispute {
  id: number;
  bookingId: string;
  client: string;
  provider: string;
  issue: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  date: string;
}

const mockReviews: Review[] = [
  {
    id: 1,
    client: 'John Smith',
    provider: 'Sarah Wilson',
    service: 'House Cleaning',
    rating: 5,
    comment: 'Excellent service! Very professional.',
    date: '2024-06-14',
    flagged: false,
  },
  {
    id: 2,
    client: 'Emma Davis',
    provider: 'Mike Johnson',
    service: 'Plumbing',
    rating: 4,
    comment: 'Good work but arrived late.',
    date: '2024-06-13',
    flagged: false,
  },
  {
    id: 3,
    client: 'David Brown',
    provider: 'Lisa Chen',
    service: 'Gardening',
    rating: 1,
    comment: 'Terrible service, very unprofessional.',
    date: '2024-06-12',
    flagged: true,
  },
  {
    id: 4,
    client: 'Anna Lee',
    provider: 'Tom Wilson',
    service: 'Electrical',
    rating: 5,
    comment: 'Outstanding! Fixed everything perfectly.',
    date: '2024-06-11',
    flagged: false,
  },
];

const mockDisputes: Dispute[] = [
  {
    id: 1,
    bookingId: 'BK-003',
    client: 'David Brown',
    provider: 'Lisa Chen',
    issue: 'Service quality complaint',
    status: 'Open',
    date: '2024-06-12',
  },
  {
    id: 2,
    bookingId: 'BK-015',
    client: 'Tom Harris',
    provider: 'Jane Smith',
    issue: 'Payment dispute',
    status: 'In Progress',
    date: '2024-06-10',
  },
  {
    id: 3,
    bookingId: 'BK-008',
    client: 'Mary Johnson',
    provider: 'John Doe',
    issue: 'Cancellation issue',
    status: 'Resolved',
    date: '2024-06-08',
  },
];

export default function ReviewsDisputes() {
  const [reviewSearch, setReviewSearch] = useState('');
  const flaggedCount = mockReviews.filter((review) => review.flagged).length;

  const filteredReviews = mockReviews.filter(
    (review) =>
      review.client.toLowerCase().includes(reviewSearch.toLowerCase()) ||
      review.provider.toLowerCase().includes(reviewSearch.toLowerCase()) ||
      review.service.toLowerCase().includes(reviewSearch.toLowerCase()) ||
      review.comment.toLowerCase().includes(reviewSearch.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`star-icon ${index < rating ? 'star-filled' : 'star-empty'}`}
        size={16}
      />
    ));
  };

  return (
    <div className="reviews-disputes-container">
      {/* Header Section */}
      <div className="reviews-disputes-header">
        <div className="header-content">
          <h1 className="page-title">Reviews & Disputes</h1>
          <p className="page-subtitle">
            Monitor reviews and manage customer disputes.
          </p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">Reviews</h2>
            <p className="section-subtitle">Monitor and moderate user reviews.</p>
          </div>
          {flaggedCount > 0 && (
            <button className="flagged-button">
              <Flag className="flagged-icon" />
              {flaggedCount} Flagged
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search reviews..."
              className="search-input"
              value={reviewSearch}
              onChange={(e) => setReviewSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Reviews Table */}
        <div className="table-container">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Provider</th>
                <th>Service</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr
                  key={review.id}
                  className={review.flagged ? 'flagged-row' : ''}
                >
                  <td className="client-cell">{review.client}</td>
                  <td className="provider-cell">{review.provider}</td>
                  <td className="service-cell">{review.service}</td>
                  <td className="rating-cell">
                    <div className="rating-stars">
                      {renderStars(review.rating)}
                    </div>
                  </td>
                  <td className="comment-cell">{review.comment}</td>
                  <td className="date-cell">{review.date}</td>
                  <td className="actions-cell">
                    <div className="actions-group">
                      {review.flagged && (
                        <button className="action-button flag-button" title="Flagged">
                          <Flag className="action-icon" />
                        </button>
                      )}
                      <button className="action-button view-button" title="View">
                        <Eye className="action-icon" />
                      </button>
                      <button className="action-button delete-button" title="Delete">
                        <Trash2 className="action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disputes Section */}
      <div className="disputes-section">
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">Disputes</h2>
            <p className="section-subtitle">Track and resolve customer disputes.</p>
          </div>
        </div>

        {/* Disputes Table */}
        <div className="table-container">
          <table className="disputes-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Client</th>
                <th>Provider</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockDisputes.map((dispute) => (
                <tr key={dispute.id}>
                  <td className="booking-id-cell">{dispute.bookingId}</td>
                  <td className="client-cell">{dispute.client}</td>
                  <td className="provider-cell">{dispute.provider}</td>
                  <td className="issue-cell">{dispute.issue}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        dispute.status === 'Open'
                          ? 'status-open'
                          : dispute.status === 'In Progress'
                          ? 'status-in-progress'
                          : 'status-resolved'
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </td>
                  <td className="date-cell">{dispute.date}</td>
                  <td className="actions-cell">
                    <button className="review-button">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

