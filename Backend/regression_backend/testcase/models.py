from django.db import models
import uuid
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

User = get_user_model()


class Team(models.Model):
    name = models.CharField(max_length=255)
    members = models.ManyToManyField(User, related_name="teams")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def clean(self):
        """
        Enforce that each user can belong to only one team.
        """
        for member in self.members.all():
            if Team.objects.filter(members=member).exclude(id=self.id).exists():
                raise ValidationError(f"User {member.username} already belongs to another team.")

class TestActionLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    test_name = models.CharField(max_length=255)
    project =  models.CharField(max_length=200)
    status = models.CharField(max_length=50)  # e.g., 'scheduled', 'running', 'completed', 'failed'
    created_at = models.DateTimeField(auto_now_add=True)
    additional_info = models.JSONField(blank=True, null=True)  

    class Meta:
        ordering = ['-created_at'] 

class Project(models.Model):
    name = models.CharField(max_length=200)
    url = models.URLField(max_length=500)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    team = models.ForeignKey('Team', on_delete=models.CASCADE, related_name="projects",null=True, blank=True)
    # user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects", null=True, blank=True)


    def __str__(self):
        return self.name

class Group(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="groups")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)


class TestCase(models.Model):
    project = models.ForeignKey(Project, related_name="testcases", on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True, related_name="testcases")
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

class TestRunReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid1, editable=False)
    project = models.ForeignKey("Project", on_delete=models.CASCADE)
    testcase = models.ForeignKey("TestCase", on_delete=models.CASCADE)
    report = models.FileField(upload_to="reports/", null=True, blank=True)
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report {self.id} for {self.testcase.name}"


    
class ScriptProject(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class ScriptCase(models.Model):
    project = models.ForeignKey(ScriptProject, related_name="testcases", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    script = models.JSONField(default=list)  # [{action, selector, value}, ...]

    def __str__(self):
        return f"{self.project.name} - {self.name}"

class ScriptResult(models.Model):
    testcase = models.ForeignKey(ScriptCase, related_name="results", on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=[("passed", "Passed"), ("failed", "Failed")])
    details = models.JSONField(default=dict)  # step-wise results
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.testcase.name} - {self.status} @ {self.created_at}"