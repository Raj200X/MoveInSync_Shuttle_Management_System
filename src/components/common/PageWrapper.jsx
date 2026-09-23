import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

export const PageWrapper = forwardRef(({ children, className = '' }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`h-full w-full ${className}`}
    >
      {children}
    </motion.div>
  );
});

PageWrapper.displayName = 'PageWrapper';
