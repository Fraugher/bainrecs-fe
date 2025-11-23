import { useState, useRef } from 'react';
import { Container, Form, Button, Card, Collapse, Alert, Spinner, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import SubmitReviewModal from './SubmitReviewModal';  

const SearchReviews = () => {
  const reviewWasSubmittedRef = useRef(false); 
  const [nameKeyword, setNameKeyword] = useState('');
  const [restaurantType, setRestaurantType] = useState('all');
  const [showBainRatings, setShowBainRatings] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRestaurant, setExpandedRestaurant] = useState(null);
  const [restaurantReviews, setRestaurantReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

  const restaurantTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'american', label: 'American' },
    { value: 'italian', label: 'Italian' },
    { value: 'european', label: 'Other European' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'indian', label: 'Indian' },
    { value: 'greek', label: 'Greek' },
    { value: 'seafood', label: 'Seafood' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'fusion', label: 'Fusion' }
  ];

  const handleOpenReviewModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    console.log("handleReviewSubmitted called!");
    if (selectedRestaurant) {
      reviewWasSubmittedRef.current = true;  // Set ref (happens immediately)
      console.log("Set reviewWasSubmitted to true");
    }
  };
  const handleCloseReviewModal = () => {
    const shouldExpand = reviewWasSubmittedRef.current;  // Read ref
    console.log("handleCloseReviewModal - reviewWasSubmitted:", shouldExpand);

    setShowReviewModal(false);
    const restaurantToExpand = selectedRestaurant?.google_maps_id;
    
    setSelectedRestaurant(null);
    reviewWasSubmittedRef.current = false;  // Reset ref
    
    if (shouldExpand) {
      // Just re-run the entire search
      setTimeout(() => {
        handleSearch().then(() => {
          if (restaurantToExpand) {
            setTimeout(() => {
              handleRestaurantClick(restaurantToExpand, true);
            }, 100);
          }
        });
      }, 300);
    }
  };
  const getProviderLogo= (provider) => {
    const logos = {
      'google-maps': '/logos/google.png',
      'facebook': '/logos/facebook.png',
      'tripadvisor': '/logos/tripadvisor.png',
      'Bain': '/logos/bain.png',
      'Yelp': '/logos/yelp.png'
    };
    return logos[provider];
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearchResults([]);
    setExpandedRestaurant(null);  // Close any expanded restaurant
    setRestaurantReviews({});  // Clear cached reviews
    let url;

    try {
      if (nameKeyword.trim()) {
        url = `${API_BASE_URL}/reviews/search_ratings?keyword=${encodeURIComponent(nameKeyword)}&restaurant_type=${restaurantType}`;
      } else {
        url = `${API_BASE_URL}/reviews/ratings?restaurant_type=${restaurantType}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      } else {
        setError(data.error || 'Failed to fetch results');
      }
    } catch (err) {
      setError('An error occurred while searching with url: ' + url);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setNameKeyword('');
    setRestaurantType('all');
    setShowBainRatings(true);
    setSearchResults([]);
    setError(null);
    setExpandedRestaurant(null);
    setRestaurantReviews({});
  };

  const handleRestaurantClick = async (googleMapsId, forceReload = false) => {
    // If clicking on already expanded restaurant, just collapse it
    if (expandedRestaurant === googleMapsId && !forceReload) {
      setExpandedRestaurant(null);
      return;
    }

    // If reviews already loaded and not forcing reload, just expand
    if (restaurantReviews[googleMapsId] && !forceReload) {
      setExpandedRestaurant(googleMapsId);
      return;
    }

    // Load reviews
    setLoadingReviews(prev => ({ ...prev, [googleMapsId]: true }));

    const url = `${API_BASE_URL}/reviews/reviews/${googleMapsId}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        let reviews = data.data.reviews;
        
        // Sort reviews: Bain first if showBainRatings is checked
        if (showBainRatings) {
          reviews = [
            ...reviews.filter(r => r.provider === 'Bain'),
            ...reviews.filter(r => r.provider !== 'Bain')
          ];
        } else {
          // Filter out Bain reviews
          reviews = reviews.filter(r => r.provider !== 'Bain');
        }

        setRestaurantReviews(prev => ({
          ...prev,
          [googleMapsId]: reviews
        }));
        setExpandedRestaurant(googleMapsId);
      } else {
        setError(data.error || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('An error occurred while loading reviews with URL: ' + url);
      console.error(err);
    } finally {
      setLoadingReviews(prev => ({ ...prev, [googleMapsId]: false }));
    }
  };
  return (
    <Container className="py-4">
      {/* Header */}
      <div className="text-left mb-4 ">
        <h1>Toronto Restaurant Reviews Search</h1>
        <p className="text-muted ms-2 me-4 fst-italic">
          The list of restaurants has already been procured to include places that are sit-down,
          quiet, elegant enough, or have private space. You can further refine your search by
          restaurant type or name.
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="name-keyword-input">Name Search:</Form.Label>
              <Form.Control
                id="name-keyword-input"
                type="text"
                placeholder="Enter name keywords"
                value={nameKeyword}
                onChange={(e) => setNameKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label htmlFor="restaurant-type-select">Type Search:</Form.Label>
              <Form.Select
                id="restaurant-type-select"
                value={restaurantType}
                onChange={(e) => setRestaurantType(e.target.value)}
              >
                {restaurantTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                id="show-bain-checkbox"
                type="checkbox"
                label="Show Bain Reviews"
                checked={showBainRatings}
                onChange={(e) => setShowBainRatings(e.target.checked)}
              />
            </Form.Group>

            <p className="text-muted small fst-italic">
              To show all restaurants, press search with empty options above
            </p>

            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={loading}
                className="flex-fill"
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleClear}
                disabled={loading}
                className="flex-fill"
              >
                Clear
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h2 className="mb-3">Search Results ({searchResults.length})</h2>

          {searchResults.map(restaurant => (
            <Card key={restaurant.google_maps_id} className="mb-3">
              <Card.Header
                onClick={() => handleRestaurantClick(restaurant.google_maps_id)}
                style={{ cursor: 'pointer' }}
                className="d-flex justify-content-between align-items-center"
              >
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-3">
                    <h5 className="mb-0">{restaurant.place_name}</h5>
                    <span className="text-muted">{restaurant.place_address}</span>
                  </div>
                  <div className="d-flex gap-3 mt-2">
                    <span>
                      <strong>Rating:</strong> {restaurant.all_ratings.average ? restaurant.all_ratings.average.toFixed(1) : 'N/A'} 
                      <span className="text-muted"> ({restaurant.all_ratings.count})</span>
                    </span>
                    {showBainRatings && (
                      <span>
                        <strong>Bain Rating:</strong> {restaurant.bain_ratings.average ? restaurant.bain_ratings.average.toFixed(1) : 'N/A'}
                        <span className="text-muted"> ({restaurant.bain_ratings.count})</span>
                      </span>
                    )}
                    <span>
                      <Badge 
                          bg="danger" 
                          as="a"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReviewModal(restaurant);
                          }}
                          style={{ cursor: 'pointer' }}
                          className="text-decoration-none"
                        >
                          Leave a Review
                        </Badge>
                    </span>
                  </div>
                </div>
                <div>
                  {loadingReviews[restaurant.google_maps_id] ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <span>{expandedRestaurant === restaurant.google_maps_id ? '▼' : '▶'}</span>
                  )}
                </div>
              </Card.Header>

              <Collapse in={expandedRestaurant === restaurant.google_maps_id}>
                <Card.Body>
                  {restaurantReviews[restaurant.google_maps_id] && restaurantReviews[restaurant.google_maps_id].length > 0 ? (
                    restaurantReviews[restaurant.google_maps_id].map(review => (
                      <div
                        key={review.id}
                        className="mb-3 p-3 bg-light rounded border-start border-primary border-4"
                      >
                        {review.review_title && (
                          <h6 className="mb-2">{review.review_title}</h6>
                        )}

                        <div className="d-flex flex-wrap gap-2 mb-2 small text-muted align-items-middle">
                          {review.review_rating && (
                            <span className="text-warning">
                              {'⭐'.repeat(review.review_rating)} ({review.review_rating}/5)
                            </span>
                          )}
                          {review.author_name && (
                            <span>by {review.author_name}</span>
                          )}
                          {review.review_date && (
                            <span>{new Date(review.review_date).toLocaleDateString()}</span>
                          )}
                          {review.provider && (
                              <Badge bg="light" text="dark" className="d-flex align-items-center gap-1 align-top provider">
                                {getProviderLogo(review.provider) && (
                                  <img 
                                    src={getProviderLogo(review.provider)} 
                                    alt={review.provider}
                                    className="provider-logo"
                                  />
                                )}
                                {review.provider}
                              </Badge>
                          )}
                        </div>

                        {review.review_text && (
                          <p className="mb-0">{review.review_text}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center fst-italic">No reviews available</p>
                  )}
                </Card.Body>
              </Collapse>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && searchResults.length === 0 && !error && (
        <div className="text-center text-muted py-5">
          <p>No results yet. Use the search form above to find restaurants.</p>
        </div>
      )}
      <SubmitReviewModal
        show={showReviewModal}
        onHide={handleCloseReviewModal}
        restaurant={selectedRestaurant}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </Container>
  );
};

export default SearchReviews;