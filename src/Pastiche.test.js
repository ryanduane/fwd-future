import React from 'react';
import { render } from '@testing-library/react';
import Pastiche from './Pastiche';

test('renders learn react link', () => {
  const { getByText } = render(<Pastiche />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
