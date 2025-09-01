from rest_framework import serializers
from .models import Project, TestCase, TestStep


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
        fields = ["id", "project", "name", "created_at", "steps"]

    def create(self, validated_data):
        steps_data = validated_data.pop("steps", [])
        testcase = TestCase.objects.create(**validated_data)

        # Use a list to store created steps
        created_steps = []
        for idx, step in enumerate(steps_data):
            created_step = TestStep.objects.create(testcase=testcase, order=idx + 1, **step)
            created_steps.append(created_step)

        # Return serializer with steps pre-fetched
        serializer = TestCaseSerializer(testcase)
        return serializer.instance
    

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['steps'] = TestStepSerializer(instance.steps.all().order_by('order'), many=True).data
        return rep
    
    

class ProjectSerializer(serializers.ModelSerializer):
    testcases = TestCaseSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ["id", "name", "url", "description", "created_at", "testcases"]
