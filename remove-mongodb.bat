@echo off
echo Removing MongoDB and switching to Firebase Firestore...
echo.

REM Delete backend directory
if exist "backend" (
    echo Removing backend directory...
    rmdir /s /q "backend"
)

REM Delete models directory
if exist "models" (
    echo Removing models directory...
    rmdir /s /q "models"
)

REM Delete app directory
if exist "app" (
    echo Removing app directory...
    rmdir /s /q "app"
)

REM Delete pages\api directory
if exist "pages\api" (
    echo Removing pages\api directory...
    rmdir /s /q "pages\api"
)

REM Delete MongoDB documentation
if exist "MONGODB_SETUP.md" (
    echo Removing MONGODB_SETUP.md...
    del /q "MONGODB_SETUP.md"
)

REM Delete old cleanup files
if exist "cleanup.ps1" (
    echo Removing cleanup.ps1...
    del /q "cleanup.ps1"
)

if exist "CLEANUP_INSTRUCTIONS.md" (
    echo Removing CLEANUP_INSTRUCTIONS.md...
    del /q "CLEANUP_INSTRUCTIONS.md"
)

if exist "QUICK_FIREBASE_SETUP.md" (
    echo Removing QUICK_FIREBASE_SETUP.md...
    del /q "QUICK_FIREBASE_SETUP.md"
)

if exist "remove-mongodb.ps1" (
    echo Removing remove-mongodb.ps1...
    del /q "remove-mongodb.ps1"
)

echo.
echo MongoDB removal completed!
echo Platform now uses Firebase Firestore exclusively.
echo.
pause
