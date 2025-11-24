import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';

const SubmitReviewModal = ({ show, onHide, restaurant, onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    authorName: '',
    reviewTitle: '',
    reviewText: '',
    reviewRating: 0
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const PYTHONANYWHERE_API_KEY = process.env.REACT_APP_PYTHONANYWHERE_API_KEY;
  const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validation
    if (!formData.reviewRating) {
      setError('Please select a rating');
      setSubmitting(false);
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append('google_maps_id', restaurant.google_maps_id);
      formPayload.append('author_name', formData.authorName);
      formPayload.append('place_name', restaurant.place_name);
      formPayload.append('review_title', formData.reviewTitle);
      formPayload.append('review_text', formData.reviewText);
      formPayload.append('review_rating', formData.reviewRating);
      let url = `${API_BASE_URL}/reviews/submit-review`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${PYTHONANYWHERE_API_KEY}`
        },
        body: formPayload
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
        // Reset form with slight delay to see success message
        setTimeout(() => {
          handleClose();
        }, 800);
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      setError('An error occurred while submitting review');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      authorName: '',
      reviewTitle: '',
      reviewText: '',
      reviewRating: 0
    });
    setHoveredRating(0);
    setError(null);
    setSuccess(false);
    onHide();
  };

  const renderStars = () => {
    return (
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => setFormData({ ...formData, reviewRating: star })}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            style={{
              cursor: 'pointer',
              fontSize: '2rem',
              color: star <= (hoveredRating || formData.reviewRating) ? '#ffc107' : '#e4e5e9'
            }}
          >
            ★
          </span>
        ))}
        {formData.reviewRating > 0 && (
          <span className="ms-2 align-self-center">
            {formData.reviewRating} / 5
          </span>
        )}
      </div>
    );
  };

  if (!restaurant) return null;

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      backdrop="static"  // Disable closing by clicking background
      keyboard={false}   // Disable closing with ESC key
      size="lg"
      background-color="light-gray"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <div>
            Bain Review of {restaurant.place_name}
            <div className="mt-2 smaller-font">
            {/* Show alerts OR default to the address to start */}
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-2 mb-0">
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert variant="success" className="mt-2 mb-0">
                Review submitted successfully!
              </Alert>
            )}
            
            {!error && !success && (
              <div className="text-muted small fw-normal">{restaurant.place_address}</div>
            )}
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>
              <strong>Your Name</strong>, Location and Title <span className="text-muted">(<Form.Text className="text-muted">
              Optional - helps others understand your perspective
            </Form.Text>)</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Tom Sawyer, New York Partner"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              maxLength={128}
            />

          </Form.Group>

          <Form.Group className="mb-2">
            <div className="d-flex align-items-center align-items-middle gap-3">
              <Form.Label>Rating <span className="text-danger">*</span>
              </Form.Label>
              <p>{renderStars()}</p>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Title of Review&nbsp;&nbsp;&nbsp;<Form.Text className="text-muted">
              {formData.reviewTitle.length} / 255 characters
            </Form.Text></Form.Label>
            <Form.Control
              type="text"
              placeholder="Brief summary of your experience"
              value={formData.reviewTitle}
              onChange={(e) => setFormData({ ...formData, reviewTitle: e.target.value })}
              maxLength={255}
            />

          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Review</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Share your experience..."
              value={formData.reviewText}
              onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleSubmit}
          disabled={submitting || success}
        >
          {submitting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Submitting...
            </>
          ) : (
            'Submit Your Review'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SubmitReviewModal;