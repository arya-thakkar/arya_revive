const Joi = require("joi");

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }
    req.body = value;
    next();
  };
}

const ADDICTION_TYPES = ["porn", "gaming", "substance", "smoking", "drinking"];

const schemas = {
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(1).max(100).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  createAddiction: Joi.object({
    addiction_type: Joi.string()
      .valid(...ADDICTION_TYPES)
      .required(),
    last_use: Joi.date().iso().allow(null),
    daily_spend: Joi.number().min(0).default(0),
    daily_hours: Joi.number().min(0).default(0),
    why_quit: Joi.string().max(1000).allow("", null),
    triggers: Joi.array().items(Joi.string()).max(20).default([]),
    motivation_level: Joi.number().min(1).max(10).default(5),
  }),

  journalEntry: Joi.object({
    addiction_id: Joi.string().uuid().required(),
    title: Joi.string().max(200).allow("", null),
    content: Joi.string().max(5000).required(),
    mood: Joi.number().min(1).max(10).allow(null),
    tags: Joi.array().items(Joi.string()).max(10).default([]),
  }),

  checkin: Joi.object({
    addiction_id: Joi.string().uuid().required(),
    mood: Joi.number().min(1).max(10).required(),
    energy: Joi.number().min(1).max(10).allow(null),
    slept_well: Joi.boolean().default(false),
    urge_level: Joi.number().min(0).max(10).default(0),
    note: Joi.string().max(500).allow("", null),
    completed_task: Joi.boolean().default(false),
  }),

  urgeLog: Joi.object({
    addiction_id: Joi.string().uuid().required(),
    intensity: Joi.number().min(1).max(10).required(),
    trigger: Joi.string().max(200).allow("", null),
    location: Joi.string().max(100).allow("", null),
    resisted: Joi.boolean().default(true),
    note: Joi.string().max(500).allow("", null),
  }),
};

module.exports = { validate, schemas };
