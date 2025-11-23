import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubmitReviewModal from './SubmitReviewModal';

// Mock fetch
global.fetch = jest.fn();

describe('SubmitReviewModal Component', () => {
  const mockRestaurant = {
    google_maps_id: 'test123',
    place_name: 'Test Restaurant',
    place_address: '123 Test Street, Toronto'
  };

  const mockOnHide = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_BACKEND_API_URL = 'http://localhost:5000';
    process.env.REACT_APP_PYTHONANYWHERE_API_KEY = 'test-api-key';
  });

  test('renders modal when show is true', () => {
    render(
      <SubmitReviewModal 
        show={true} 
        onHide={mockOnHide} 
        restaurant={mockRestaurant} 
      />
    );
    
    expect(screen.getByText(/Bain Review of Test Restaurant/i)).toBeInTheDocument();
    expect(screen.getByText('123 Test Street, Toronto')).toBeInTheDocument();
  });

  test('does not render when show is false', () => {
    const { container } = render(
      <SubmitReviewModal 
        show={false} 
        onHide={mockOnHide} 
        restaurant={mockRestaurant} 
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('does not render when restaurant is null', () => {
    const { container } = render(
      <SubmitReviewModal 
        show={true} 
        onHide={mockOnHide} 
        restaurant={null} 
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('renders all form fields', () => {
    render(
      <SubmitReviewModal 
        show={true} 
        onHide={mockOnHide} 
        restaurant={mockRestaurant} 
      />
    );
    
    expect(screen.getByPlaceholderText(/e.g., Tom Sawyer/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Brief summary/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Share your experience/i)).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
  });

  test('star rating system works', () => {
    render(
      <SubmitReviewModal 
        show={true} 
        onHide={mockOnHide} 
        restaurant={mockRestaurant} 
      />
    );
    
    const stars = screen.getAllByText('★');
    
    // Click on the 4th star
    fireEvent.click(stars[3]);
    
    // Should show "4 / 5"
    expect(screen.getByText('4 / 5')).toBeInTheDocument();
  });

  test('form fields update on user input', () => {
    render(
      <SubmitReviewModal 
        show={true} 
        onHide={mockOnHide} 
        restaurant={mockRestaurant} 
      />
    );
    
    const nameInput = screen.getByPlaceholderText(/e.g., Tom Sawyer/i);
    const titleInput = screen.getByPlaceholderText(/Brief summary/i);
    const reviewInput = screen.getByPlaceholderText(/Share your experience/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(titleInput, { target: { value: 'Great place!' } });
    fireEvent.change(reviewInput, { target: { value: 'Amazing food and service' } });
    
    expect(nameInput.value).toBe('John Doe');
    expect(titleInput.value).toBe('Great place!');
    expect(reviewInput.value).toBe('Amazing food and service');
  });

  test('shows validation error when submitting without rating', async () => {
    render(
      <SubmitReviewModal 
        show={true} 
        onHide={mockOnHide} 
        restaurant={mockRestaurant} 
      />
    );
    
    const submitButton = screen.getByRole('button', { name: /Submit Your Review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please select a rating')).toBeInTheDocument();
    });
  });

  test('submits form with correct data', async () => {
    const mockResponse = {
      success: true
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    });

    render(
      <SubmitReviewModal 
        show={true} 
        onHide={mockOnHide} 
        restaurant={mockRestaurant} 
      />
    );
    
    // Fill in the form
    const nameInput = screen.getByPlaceholderText(/e.g., Tom Sawyer/i);
    const titleInput = screen.getByPlaceholderText(/Brief summary/i);
    const reviewInput = screen.getByPlaceholderText(/Share your experience/i);
    const stars = screen.getAllByText('★');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(titleInput, { target: { value: 'Excellent!' } });
    fireEvent.change(reviewInput, { target: { value: 'Great experience' } });
    fireEvent.click(stars[4]); // 5 stars
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /Submit Your Review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reviews/submit-review'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Token test-api-key'
          })
        })
      );
    });
  });

  test('displays success message after successful submission', async () => {
    const mockResponse = {
      success: true
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    });

    render(
      <SubmitReviewModal 
        show={true} 
        onHide={mockOnHide} 
        restaurant={mockRestaurant} 
      />
    );
    
    // Fill in minimal required fields
    const stars = screen.getAllByText('★');
    fireEvent.click(stars[4]); // 5 stars
    
    const submitButton = screen.getByRole('button', { name: /Submit Your Review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Review submitted successfully!')).toBeInTheDocument();
    });
  });

  test('displays error message when submission fails', async () => {
    const mockResponse = {
      success: false,
      error: 'Database error'
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    });

    render(
      <SubmitReviewModal 
        show={true} 
        onHide={mockOnHide} 
        restaurant={mockRestaurant} 
      />
    );
    
    // Fill in required fields
    const stars = screen.getAllByText('★');
    fireEvent.click(stars[4]);
    
    const submitButton = screen.getByRole('button', { name: /Submit Your Review/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument();
    });
  });
});