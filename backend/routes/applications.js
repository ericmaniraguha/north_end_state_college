const router = require('express').Router();
const { validateApplication, createApplication } = require('../lib/applications');
const verification = require('../lib/emailVerification');
const messaging = require('../messaging');

const SUBMITTED = 'Application received. Our admissions team will contact you shortly.';

function submit(data, emailVerified) {
  const id = createApplication(data, { emailVerified });
  messaging.events.applicationSubmitted(id);
  return { id, message: SUBMITTED };
}

// A first-time email address gets a one-time code (202) and the application waits for
// POST /verify. Applications without an email, or with an address verified before, are
// saved straight away (201).
router.post('/', async (req, res, next) => {
  try {
    const { data, errors } = validateApplication(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const knownEmail = Boolean(data.email) && verification.isVerified(data.email);
    if (data.email && !knownEmail && verification.active()) {
      try {
        const pending = await verification.start(data.email, data);
        return res.status(202).json({
          verification: pending,
          message: `We sent a 6-digit code to ${data.email}. Enter it to finish your application.`,
        });
      } catch (err) {
        console.error(`[verification] could not email a code to ${data.email}: ${err.message}`);
        return res.status(502).json({
          errors: { email: "We couldn't send a code to this email address. Check it, or leave it empty and apply with your phone number." },
        });
      }
    }

    return res.status(201).json(submit(data, knownEmail));
  } catch (err) {
    return next(err);
  }
});

// { token, code } → saves the waiting application. Synchronous on purpose, so the same
// code can't be used twice by two requests at once.
router.post('/verify', (req, res) => {
  const result = verification.check(req.body.token, req.body.code);
  if (!result.ok) return res.status(result[0]).json(result[1]);

  const created = submit(result.payload, true);
  verification.complete(result.verification, created.id);
  return res.status(201).json(created);
});

// { token } → emails a new code (at most once a minute, five times in all)
router.post('/verify/resend', async (req, res) => {
  try {
    const [status, body] = await verification.resend(req.body.token);
    return res.status(status).json(body);
  } catch (err) {
    console.error(`[verification] could not resend a code: ${err.message}`);
    return res.status(502).json({ error: "We couldn't send a new code. Please try again in a moment." });
  }
});

module.exports = router;
