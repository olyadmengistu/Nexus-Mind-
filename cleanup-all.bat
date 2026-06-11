@echo off
echo ========================================
echo NexusMind Platform Cleanup
echo ========================================
echo.

REM Delete backend directory (MongoDB-based)
if exist "backend" (
    echo [1/7] Removing backend directory (MongoDB-based)...
    rmdir /s /q "backend"
    echo       - Done
) else (
    echo [1/7] backend directory not found - skipping
)

REM Delete models directory (Mongoose schemas)
if exist "models" (
    echo [2/7] Removing models directory (Mongoose schemas)...
    rmdir /s /q "models"
    echo       - Done
) else (
    echo [2/7] models directory not found - skipping
)

REM Delete app directory (Next.js structure)
if exist "app" (
    echo [3/7] Removing app directory (Next.js structure)...
    rmdir /s /q "app"
    echo       - Done
) else (
    echo [3/7] app directory not found - skipping
)

REM Delete pages\api directory (Next.js API routes)
if exist "pages\api" (
    echo [4/7] Removing pages\api directory (Next.js API routes)...
    rmdir /s /q "pages\api"
    echo       - Done
) else (
    echo [4/7] pages\api directory not found - skipping
)

REM Delete MongoDB documentation
if exist "MONGODB_SETUP.md" (
    echo [5/7] Removing MONGODB_SETUP.md...
    del /q "MONGODB_SETUP.md"
    echo       - Done
) else (
    echo [5/7] MONGODB_SETUP.md not found - skipping
)

REM Delete redundant Firebase documentation
if exist "QUICK_FIREBASE_SETUP.md" (
    echo [6/7] Removing QUICK_FIREBASE_SETUP.md (redundant)...
    del /q "QUICK_FIREBASE_SETUP.md"
    echo       - Done
) else (
    echo [6/7] QUICK_FIREBASE_SETUP.md not found - skipping
)

REM Delete old cleanup scripts
if exist "remove-mongodb.bat" (
    echo [7/7] Removing remove-mongodb.bat...
    del /q "remove-mongodb.bat"
    echo       - Done
) else (
    echo [7/7] remove-mongodb.bat not found - skipping
)

echo.
echo ========================================
echo Cleanup Completed Successfully!
echo ========================================
echo.
echo Platform now uses Firebase Firestore exclusively.
echo.
echo Next steps:
echo 1. Update your .env file with Firebase config
echo 2. Run: npm install
echo 3. Run: npm run dev
echo.
echo This cleanup script will now delete itself...
del /q "%~f0"
