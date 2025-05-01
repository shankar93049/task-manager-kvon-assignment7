
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, dueDate, priority, tags } = req.body;

    const newTask = new Task({
      title,
      description,
      dueDate,
      priority,
      tags,
      createdBy: req.user.id
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});


router.delete('/:id', protect, authorizedRoles('admin'), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

router.patch('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the creator or admin can update
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    Object.assign(task, req.body);
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const { status, priority, dueDate, page = 1, limit = 3 } = req.query;

    const filter = {};
    if (req.user.role !== 'admin') {
      filter.createdBy = req.user.id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };

    const tasks = await Task.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ dueDate: 1 });

    const totalTasks = await Task.countDocuments(filter);
    const totalPages = Math.ceil(totalTasks / limit);

    res.json({
      tasks,
      totalPages,
      currentPage: Number(page)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

module.exports = router;
