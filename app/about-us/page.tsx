import React from 'react';
import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Mintex Staffing - Innovation at Speed',
  description: 'Learn about Mintex Staffing. We connect ambition with opportunity and move at the speed of innovation.',
};

const AboutUsPage = () => {
  return <AboutClient />;
};

export default AboutUsPage;