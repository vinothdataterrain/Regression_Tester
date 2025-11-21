from rest_framework import serializers
from .models import Project, TestCase, TestStep, ScriptCase,ScriptProject, ScriptResult, TestActionLog, Group
from rest_framework.fields import CurrentUserDefault
from django.contrib.auth.models import User
import os
from django.conf import settings

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]

class TestStepSerializer(serializers.ModelSerializer):
    step_number = serializers.SerializerMethodField()


    def get_step_number(self, obj):
        # generate per-testcase numbering (starts from 1)
        steps = obj.testcase.steps.all().order_by("order", "id")
        return list(steps).index(obj) + 1
    class Meta:
        model = TestStep
        fields = ["step_number", "order", "action", "selector", "value", "url"]


class TestCaseSerializer(serializers.ModelSerializer):
    steps = TestStepSerializer(many=True)  # fetch steps for GET
    class Meta:
        model = TestCase
        fields = ["id", "project", "group", "name", "created_at","steps"]

    def create(self, validated_data):
        steps_data = validated_data.pop("steps", [])
        testcase = TestCase.objects.create(**validated_data)

        for idx, step in enumerate(steps_data):
            TestStep.objects.create(testcase=testcase, order=idx + 1, **step)

        return testcase
    def update(self, instance, validated_data):
        # Update main testcase fields
        instance.name = validated_data.get('name', instance.name)
        instance.project = validated_data.get('project', instance.project)
        instance.save()

        # Handle steps update
        steps_data = validated_data.get('steps', [])

        # Clear existing steps and recreate them
        instance.steps.all().delete()

        for idx, step in enumerate(steps_data):
            TestStep.objects.create(testcase=instance, order=idx + 1, **step)

        return instance

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['steps'] = TestStepSerializer(instance.steps.all().order_by('order'), many=True).data
        return rep
    

class GroupSerializer(serializers.ModelSerializer):
    group_report = serializers.SerializerMethodField()
    testcases = TestCaseSerializer(many=True, read_only=True)
    class Meta:
        model = Group
        fields = ["id", "project", "name", "description", "testcases", "group_report"]

    def get_group_report(self, obj):
        # If your group report files are named consistently, e.g. group_report_<groupname>...
        reports_dir = os.path.join(settings.MEDIA_ROOT, "reports")
        prefix = f"group_report_{obj.name.replace(' ', '_')}_"
        
        # Look for existing reports for this group
        matching_reports = [
            f for f in os.listdir(reports_dir) if f.startswith(prefix)
        ] if os.path.exists(reports_dir) else []

        if matching_reports:
            # Return the most recent report
            latest_report = sorted(matching_reports)[-1]
            return f"reports/{latest_report}"
        return ""

    
class ProjectSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    # user = serializers.HiddenField(default=CurrentUserDefault())

    class Meta:
        model = Project
        fields = ["id", "name", "url", "description", "created_at", "groups"]
        read_only_fields = ["testcases", "created_at", "team"]

class ScriptResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScriptResult
        fields = ["id", "status", "details", "created_at"]


class ScriptCaseSerializer(serializers.ModelSerializer):
    results = serializers.SerializerMethodField()

    class Meta:
        model = ScriptCase
        fields = ["id", "name", "script", "results"]

    def get_results(self, obj):
        # fetch latest results
        latest_result = obj.results.order_by("-created_at").first()
        # results = obj.results.all().order_by("-created_at")[:2]
        return ScriptResultSerializer([latest_result], many=True).data if latest_result else []


class ScriptProjectSerializer(serializers.ModelSerializer):
    testcases = ScriptCaseSerializer(many=True, read_only=True)

    class Meta:
        model = ScriptProject
        fields = ["id", "name", "description", "testcases"]


class TestActionLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TestActionLog
        fields = ['id', 'test_name', 'status', 'user_name', 'created_at', 'additional_info']
