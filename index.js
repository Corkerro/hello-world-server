const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = 8080;
const password = process.env.PASSWORD;
// Connect to MongoDB
mongoose
  .connect(`mongodb+srv://admin:${password}@cluster0.slnmffa.mongodb.net/`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// Create teacher and course schemas
const teacherSchema = new mongoose.Schema({
  name_ru: String,
  name_en: String,
  name_ua: String,
  description_ru: String,
  description_en: String,
  description_ua: String,
  photo: String,
});

const courseSchema = new mongoose.Schema({
  name_ru: String,
  name_en: String,
  name_ua: String,
  description_ru: String,
  description_en: String,
  description_ua: String,
  photo: String,
});

// Create teacher and course models
const Teacher = mongoose.model('Teacher', teacherSchema);
const Course = mongoose.model('Course', courseSchema);

// Enable CORS
app.use(cors());

// Enable parsing of JSON body
app.use(express.json());

// Create POST handlers for teachers and courses
app.post('/teachers', async (req, res) => {
  try {
    const {
      name_ru,
      name_en,
      name_ua,
      description_ru,
      description_en,
      description_ua,
      photo,
      auth,
    } = req.body;
    if (auth === password) {
      const teacher = new Teacher({
        name_ru,
        name_en,
        name_ua,
        description_ru,
        description_en,
        description_ua,
        photo,
      });
      await teacher.save();
      res.send(teacher);
    } else {
      res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post('/courses', async (req, res) => {
  try {
    const {
      name_ru,
      name_en,
      name_ua,
      description_ru,
      description_en,
      description_ua,
      photo,
      auth,
    } = req.body;
    if (auth === password) {
      const course = new Course({
        name_ru,
        name_en,
        name_ua,
        description_ru,
        description_en,
        description_ua,
        photo,
      });
      await course.save();
      res.send(course);
    } else {
      res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

// Create GET handlers for teachers and courses
app.get('/teachers/:language', async (req, res) => {
  const language = req.params.language;
  if (['ru', 'en', 'ua'].includes(language)) {
    const { page = 1, perpage = 10 } = req.query;
    const totalTeachers = await Teacher.countDocuments();
    const totalPages = Math.ceil(totalTeachers / perpage);
    const teachers = await Teacher.find(
      {},
      { [`name_${language}`]: 1, [`description_${language}`]: 1, photo: 1 },
    )
      .skip((page - 1) * perpage)
      .limit(parseInt(perpage));
    res.send({ totalPages, teachers });
  } else {
    res.status(400).send('Invalid language');
  }
});

app.get('/courses/:language', async (req, res) => {
  const language = req.params.language;
  if (['ru', 'en', 'ua'].includes(language)) {
    const { page = 1, perpage = 10 } = req.query;
    const totalCourses = await Course.countDocuments();
    const totalPages = Math.ceil(totalCourses / perpage);
    const courses = await Course.find(
      {},
      { [`name_${language}`]: 1, [`description_${language}`]: 1, photo: 1 },
    )
      .skip((page - 1) * perpage)
      .limit(parseInt(perpage));
    res.send({ totalPages, courses });
  } else {
    res.status(400).send('Invalid language');
  }
});

// Create PUT handlers for teachers and courses
app.put('/teachers/:id', async (req, res) => {
  const { name_ru, name_en, name_ua, description_ru, description_en, description_ua, photo, auth } =
    req.body;
  if (auth === password) {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { name_ru, name_en, name_ua, description_ru, description_en, description_ua, photo },
      { new: true },
    );
    if (!teacher) {
      res.status(404).send('Teacher not found');
    } else {
      res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
  } else {
    res.send(teacher);
  }
});

app.put('/courses/:id', async (req, res) => {
  const { name_ru, name_en, name_ua, description_ru, description_en, description_ua, photo, auth } =
    req.body;
  if (auth === password) {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { name_ru, name_en, name_ua, description_ru, description_en, description_ua, photo },
      { new: true },
    );
    if (!course) {
      res.status(404).send('Course not found');
    } else {
      res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
  } else {
    res.send(course);
  }
});

// Create DELETE handlers for teachers and courses
app.delete('/teachers/:id', async (req, res) => {
  const { auth } = req.body;
  if (auth === password) {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      res.status(404).send('Teacher not found');
    } else {
      res.send('Teacher deleted');
    }
  } else {
    res.status(403).json({ message: 'You do not have permission to perform this action' });
  }
});

app.delete('/courses/:id', async (req, res) => {
  const { auth } = req.body;
  if (auth === password) {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      res.status(404).send('Course not found');
    } else {
      res.send('Course deleted');
    }
  } else {
    res.status(403).json({ message: 'You do not have permission to perform this action' });
  }
});

// Start the server
app.listen(port, () => console.log(`Server listening on port ${port}`));
