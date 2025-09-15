from django.contrib import admin
from .models import Project, TestCase, TestStep,TestRun

# Inline for TestStep inside TestCase
class TestStepInline(admin.TabularInline):  # or StackedInline
    model = TestStep
    extra = 1


# Inline for TestCase inside Project
class TestCaseInline(admin.TabularInline):
    model = TestCase
    extra = 1


# Admin for Project
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "url", "description", "created_at")
    inlines = [TestCaseInline]


# Admin for TestCase
@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ("name", "project", "created_at")
    inlines = [TestStepInline]


# Admin for TestStep
@admin.register(TestStep)
class TestStepAdmin(admin.ModelAdmin):
    list_display = ("order", "action", "selector", "value", "url", "testcase")

@admin.register(TestRun)
class TestRunAdmin(admin.ModelAdmin):
    list_display = ("testcase", "result_file", "status", "progress")