# Generated by Django 5.1.3 on 2024-12-01 05:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shoppingcart', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='slug',
        ),
        migrations.AddField(
            model_name='product',
            name='price',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='product',
            name='amountselected',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='product',
            name='description',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='product',
            name='name',
            field=models.CharField(max_length=100),
        ),
    ]
