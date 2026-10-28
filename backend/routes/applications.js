const router = require('express').Router();
const { validateApplication, createApplication } = require('../lib/applications');

router.post('/', (req, res) => {
  const { data, errors } = validateApplication(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  res.status(201).json({
    id: createApplication(data),
    message: 'Application received. Our admissions team will contact you shortly.',
  });
});

module.exports = router;
