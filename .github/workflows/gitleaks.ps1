#Create Software folder for download

New-Item -ItemType Directory -Force -Path C:/Software

#Install gitleaks

New-Object System.Net.WebClient).DownloadFile("https://github.com/zricethezav/gitleaks/releases/download/v8.15.2/gitleaks_8.15.2_windows_x64.zip", "C:/Software/gitleaks_8.15.2_windows_x64.zip")

#Extract gitleaks zip file

Add-Type -AssemblyName System.IO.Compression.FileSystem

[System.IO.Compression.ZipFile]::ExtractToDirectory('C:/Software\gitleaks_8.15.2_windows_x64.zip', 'C:/gitleaks')
