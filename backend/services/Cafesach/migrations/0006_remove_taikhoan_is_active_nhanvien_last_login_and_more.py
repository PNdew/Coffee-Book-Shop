# Generated by Django 5.1.7 on 2025-03-24 17:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Cafesach', '0005_remove_nhanvien_is_active_remove_nhanvien_last_login_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='taikhoan',
            name='is_active',
        ),
        migrations.AddField(
            model_name='nhanvien',
            name='last_login',
            field=models.DateTimeField(blank=True, null=True, verbose_name='last login'),
        ),
        migrations.AlterField(
            model_name='nhanvien',
            name='is_superuser',
            field=models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status'),
        ),
    ]
