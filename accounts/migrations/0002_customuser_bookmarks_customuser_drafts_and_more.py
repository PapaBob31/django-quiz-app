# Generated by Django 4.0 on 2022-08-18 23:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0004_alter_question_correct_option'),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='bookmarks',
            field=models.ManyToManyField(related_name='bookmarked_by', to='pages.Quiz'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='drafts',
            field=models.ManyToManyField(related_name='saved_as_draft_by', to='pages.Quiz'),
        ),
        migrations.AddField(
            model_name='customuser',
            name='following',
            field=models.ManyToManyField(related_name='followers', to='accounts.CustomUser'),
        ),
    ]