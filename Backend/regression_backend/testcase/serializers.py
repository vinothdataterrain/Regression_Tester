from rest_framework import serializers
from .models import Project, TestCase, TestStep, ScriptCase,ScriptProject, ScriptResult, TestActionLog
from rest_framework.fields import CurrentUserDefault
from django.contrib.auth.models import User

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
        fields = ["id", "project", "name", "created_at","steps"]

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
    
    

class ProjectSerializer(serializers.ModelSerializer):
    testcases = TestCaseSerializer(many=True, read_only=True)
    # user = serializers.HiddenField(default=CurrentUserDefault())

    class Meta:
        model = Project
        fields = ["id", "name", "url", "description", "created_at", "testcases"]
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
        # fetch latest 2 results
        results = obj.results.all().order_by("-created_at")[:2]
        return ScriptResultSerializer(results, many=True).data


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
