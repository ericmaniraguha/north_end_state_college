const router = require('express').Router();
const { validateApplication, createApplication } = require('../lib/applications');
const messaging = require('../messaging');

router.post('/', (req, res) => {
  const { data, errors } = validateApplication(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const id = createApplication(data);
  messaging.events.applicationSubmitted(id);
  res.status(201).json({
    id,
    message: 'Application received. Our admissions team will contact you shortly.',
  });
});

module.exports = router;
