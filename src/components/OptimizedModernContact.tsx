import { memo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  useTheme,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import emailjs from '@emailjs/browser';
import { CONTACT } from '../constants';

// ---------------------------------------------------------------------------
// Validation schema — DO NOT change field names: they map to the EmailJS
// template params (from_name, reply_to, message).
// ---------------------------------------------------------------------------
const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  email: z.string().trim().email('Please enter a valid email address'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

type SubmitState = 'idle' | 'success' | 'error';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

const OptimizedModernContactComponent = () => {
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitState('idle');
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        throw new Error('EmailJS environment variables are not configured');
      }
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: data.name,
          reply_to: data.email,
          message: data.message,
        },
        { publicKey: EMAILJS_PUBLIC_KEY },
      );
      setSubmitState('success');
      reset();
    } catch {
      setSubmitState('error');
    }
  };

  const reveal = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: { duration: 0.5, ease: REVEAL_EASE },
      };

  return (
    <Box>
      {/* Heading */}
      <Box
        component={motion.div}
        {...reveal}
        sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}
      >
        <Typography
          variant="overline"
          component="p"
          sx={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: 3,
            color: theme.palette.primary.main,
            display: 'block',
            mb: 1,
          }}
        >
          Get In Touch
        </Typography>
        <Typography
          variant="h2"
          component="h2"
          sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1.5 }}
        >
          Get in touch
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 540, mx: 'auto' }}>
          Open to research collaborations, AI engineering roles, and software opportunities. Reach me
          directly at{' '}
          <Box
            component="a"
            href={`mailto:${CONTACT.email}`}
            sx={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
              fontWeight: 600,
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.2s ease',
              '&:hover': { borderBottomColor: theme.palette.primary.main },
              '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
            }}
          >
            {CONTACT.email}
          </Box>
          {' '}or send a message below.
        </Typography>
      </Box>

      {/* Form card */}
      <Box
        component={motion.div}
        {...reveal}
        sx={{
          maxWidth: 600,
          mx: 'auto',
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3,
          backgroundColor: 'var(--app-palette-bg-elevated)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          <TextField
            label="Name"
            fullWidth
            autoComplete="name"
            error={Boolean(errors.name)}
            helperText={errors.name?.message ?? ' '}
            slotProps={{ formHelperText: { role: 'alert' } }}
            {...register('name')}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message ?? ' '}
            slotProps={{ formHelperText: { role: 'alert' } }}
            {...register('email')}
          />
          <TextField
            label="Message"
            fullWidth
            multiline
            minRows={4}
            error={Boolean(errors.message)}
            helperText={errors.message?.message ?? ' '}
            slotProps={{ formHelperText: { role: 'alert' } }}
            {...register('message')}
          />

          {submitState === 'success' && (
            <Alert severity="success" role="status">
              Thanks for reaching out — I&apos;ll get back to you soon.
            </Alert>
          )}
          {submitState === 'error' && (
            <Alert severity="error" role="alert">
              Something went wrong sending your message. Please email me directly at{' '}
              <Box component="a" href={`mailto:${CONTACT.email}`} sx={{ color: 'inherit', fontWeight: 600 }}>
                {CONTACT.email}
              </Box>
              .
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            startIcon={<SendIcon sx={{ fontSize: 18 }} />}
            sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, px: 3 }}
          >
            {isSubmitting ? 'Sending…' : 'Send message'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const OptimizedModernContact = memo(OptimizedModernContactComponent);
OptimizedModernContact.displayName = 'OptimizedModernContact';

export default OptimizedModernContact;
