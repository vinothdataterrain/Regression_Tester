from django.db import models
import uuid


class Project(models.Model):
    name = models.CharField(max_length=200)
    url = models.URLField(max_length=500)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class TestCase(models.Model):
    project = models.ForeignKey(Project, related_name="testcases", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.project.name} → {self.name}"


class TestStep(models.Model):
    testcase = models.ForeignKey(TestCase, related_name="steps", on_delete=models.CASCADE)
    action = models.CharField(max_length=100, blank=True)   # e.g. "click", "input", "goto"
    value = models.CharField(max_length=500, blank=True)    # text input or expected value
    selector = models.CharField(max_length=500, blank=True) # CSS/XPath selector
    url = models.URLField(max_length=500, blank=True)       # for navigation
    order = models.PositiveIntegerField(default=0)          # step sequence
    
    def save(self, *args, **kwargs):
        if self.order is None or self.order == 0:
            # place step at the end of this testcase
            last_order = TestStep.objects.filter(testcase=self.testcase).count()
            self.order = last_order + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.testcase.name} [Step {self.order}: {self.action}]"
class TestRun(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid1, editable=False)
    testcase = models.ForeignKey("TestCase", on_delete=models.CASCADE, related_name="runs")
    result_file = models.FileField(upload_to="results/", null=True, blank=True)
    status = models.CharField(max_length=20, default="queued")  # queued, running, completed, failed
    progress = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Run {self.id} for {self.testcase.name}"