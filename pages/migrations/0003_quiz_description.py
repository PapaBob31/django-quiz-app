# Generated by Django 4.0 on 2022-08-15 03:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0002_alter_option_question'),
    ]

    operations = [
        migrations.AddField(
            model_name='quiz',
            name='description',
            field=models.CharField(blank=True, default='', max_length=250),
        ),
    ]
