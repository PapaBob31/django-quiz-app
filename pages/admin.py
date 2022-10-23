from django.contrib import admin
from pages.models import Quiz, Question, Option

class QuestionInline(admin.TabularInline):
	model = Question
	extra = 0

class QuizQuestions(admin.ModelAdmin):
	inlines = [QuestionInline,]

class OptionInline(admin.TabularInline):
	model = Option
	extra = 0

class QuestionOptions(admin.ModelAdmin):
	inlines = [OptionInline,]

admin.site.register(Quiz, QuizQuestions)
admin.site.register(Question, QuestionOptions)
admin.site.register(Option)
