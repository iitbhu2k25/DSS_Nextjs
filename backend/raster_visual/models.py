from django.db import models

# Create your models here.
class RasterVisual(models.Model):
    organization = models.CharField(max_length=100)
    name=models.CharField(max_length=100)
    file_location=models.FileField(upload_to='raster/')

    def __str__(self):
        return f"{self.name} - {self.organization}"