import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchReviews from './SearchReviews';

// Mock the SubmitReviewModal component
jest.mock('./SubmitReviewModal', () => {
  return function MockSubmitReviewModal() {
    return <div data-testid="submit-review-modal">Mock Submit Review Modal</div>;
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('SearchReviews Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up environment variable
    process.env.REACT_APP_BACKEND_API_URL = 'http://localhost:5000';
  });

  test('renders search form with all elements', () => {
    render(<SearchReviews />);
    
    // Check for header
    expect(screen.getByText('Toronto Restaurant Reviews Search')).toBeInTheDocument();
    
    // Check for form elements
    expect(screen.getByPlaceholderText('Enter name keywords')).toBeInTheDocument();
    expect(screen.getByLabelText('Type Search:')).toBeInTheDocument();
    expect(screen.getByLabelText('Show Bain Reviews')).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  test('updates input fields when user types', () => {
    render(<SearchReviews />);
    
    const nameInput = screen.getByPlaceholderText('Enter name keywords');
    fireEvent.change(nameInput, { target: { value: 'Italian Restaurant' } });
    
    expect(nameInput.value).toBe('Italian Restaurant');
  });

  test('search button triggers API call with correct parameters', async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          google_maps_id: 'test123',
          place_name: 'Test Restaurant',
          place_address: '123 Test St',
          all_ratings: { average: 4.5, count: 10 },
          bain_ratings: { average: 4.0, count: 2 }
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    });

    render(<SearchReviews />);
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reviews/ratings?restaurant_type=all')
      );
    });

    // Check if results are displayed
    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    });
  });

  test('search with name keyword includes keyword in API call', async () => {
    const mockResponse = {
      success: true,
      data: []
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse
    });

    render(<SearchReviews />);
    
    const nameInput = screen.getByPlaceholderText('Enter name keywords');
    fireEvent.change(nameInput, { target: { value: 'pasta' } });
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('keyword=pasta')
      );
    });
  });

  test('clear button resets all form fields', () => {
    render(<SearchReviews />);
    
    // Set some values
    const nameInput = screen.getByPlaceholderText('Enter name keywords');
    fireEvent.change(nameInput, { target: { value: 'Test' } });
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);
    
    // Check values are reset
    expect(nameInput.value).toBe('');
  });

  test('displays error message when API call fails', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'));

    render(<SearchReviews />);
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/An error occurred while searching/i)).toBeInTheDocument();
    });
  });

  test('bain checkbox toggles correctly', () => {
    render(<SearchReviews />);
    
    const checkbox = screen.getByLabelText('Show Bain Reviews');
    
    // Initially checked
    expect(checkbox).toBeChecked();
    
    // Click to uncheck
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    
    // Click to check again
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});