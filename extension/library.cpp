#include <string>
#include <cstring>
#include <fstream>
#include <iostream>
#include <sstream>
#include <iomanip>
#include <vector>
#include <ctime>
#include <mutex>

#ifdef _WIN64
#define WIN32_LEAN_AND_MEAN
#include <Windows.h>

BOOL APIENTRY DllMain( HMODULE hModule, DWORD ul_reason_for_call, LPVOID lpReserved )
{
    switch ( ul_reason_for_call )
    {
    case DLL_PROCESS_ATTACH:
        break;
    case DLL_THREAD_ATTACH:
        break;
    case DLL_THREAD_DETACH:
        break;
    case DLL_PROCESS_DETACH:
        break;
    }
    return TRUE;
}

#define DLLEXPORT __declspec(dllexport)
#define STDCALL __stdcall

#else

#define DLLEXPORT
#define STDCALL

#endif

#define EXTENSION_VERSION "0.9.0"

#define INDEX_FILENAME "index.tsv"
#define TEMP_DIR "Temp"
#define LOG_FILE "logs/cntr.log"


std::mutex mutex;
std::ofstream logStream( LOG_FILE );
std::ofstream fileStream;
std::string captureFileName;
std::string captureFilePath;

struct CaptureInfo 
{
    std::string formatVersion;
    std::string missionName;
    std::string worldName;
    std::string author;
    std::string captureInterval;
    std::string exportDir;
    std::time_t time;
};

CaptureInfo captureInfo;


std::string createCaptureFilename( const CaptureInfo& captureInfo )
{
    char timestamp[32];
    strftime( timestamp, sizeof( timestamp ), "__%Y-%m-%d__%H-%M.cntr", localtime( &captureInfo.time ) );
    
    std::stringstream filename;
    filename << captureInfo.missionName << timestamp;
    std::cout << filename.str();
    return filename.str();
}

void log( const std::string& message )
{
    std::cerr << message << std::endl;
    logStream << message << std::endl;
}

int getCaptureLength()
{
    int count = 0;

    std::ifstream stream( captureFilePath );
    std::string line;
    
    while ( std::getline( stream, line ) ) count += 1;

    return count - 1;
}

void startCapture( const CaptureInfo& captureInfo )
{
    captureFileName = createCaptureFilename( captureInfo );

    captureFilePath = std::string( TEMP_DIR ) + '/' + captureFileName;

    fileStream.open( captureFilePath, std::ios_base::out | std::fstream::app );

    if ( fileStream.good() )
    {
        log( "CNTR: Error! Cannot open '" + captureFilePath + "'!" );
    }
    else
    {
        fileStream << captureInfo.formatVersion << ',' 
                   << captureInfo.missionName << ',' 
                   << captureInfo.worldName << ',' 
                   << captureInfo.author << ',' 
                   << captureInfo.captureInterval << std::endl;
        fileStream.flush();
    }
}

void appendCaptureData( const std::string& captureData )
{
    if ( fileStream.is_open() )
    {
        fileStream << captureData;
        fileStream.flush();
    }
    else
    {
        log( "CNTR: Error! Attempting to write to closed file stream!" );
    }
}

void stopCapture()
{
    if ( fileStream.is_open() )
    {
        fileStream.close();
        
        auto destinationFilePath = captureInfo.exportDir + '/' + captureFileName;

        std::rename( captureFilePath.c_str(), destinationFilePath.c_str() );

        auto timestamp = static_cast<long>( captureInfo.time );
        auto captureLength = getCaptureLength();
        
        auto indexFilePath = captureInfo.exportDir + '/' + INDEX_FILENAME;
        
        std::ofstream indexFile( indexFilePath, std::ios_base::out | std::ios_base::app );
        indexFile << captureInfo.missionName << '\t' 
                  << captureInfo.worldName << '\t' 
                  << captureLength << '\t' 
                  << timestamp << '\t' 
                  << captureFileName << std::endl;
    }
    else
    {
        log( "CNTR: Error! File stream already closed!" );
    }
}

extern "C" DLLEXPORT void STDCALL RVExtensionVersion( char* output, int outputSize )
{
    outputSize -= 1;
    strncpy(output, EXTENSION_VERSION, outputSize);
}

extern "C" DLLEXPORT int STDCALL RVExtensionArgs( char* output, int outputSize, const char* function, const char** args, int argCnt )
{
    std::lock_guard<std::mutex> lock( mutex );
    std::string functionName( function );
    
    if ( functionName == "start" && argCnt == 6 )
    {
        captureInfo = { args[ 0 ], args[ 1 ], args[ 2 ], args[ 3 ], args[ 4 ], args[ 5 ], std::time( nullptr ) };
        startCapture( captureInfo );
    }
    else if ( functionName == "append" && argCnt == 1 )
    {
        appendCaptureData( args[ 0 ] );
    }
    else if ( functionName == "stop" && argCnt == 0 )
    {
        stopCapture();
    }
    
    return 0;
}

int main()
{
    const char* args[] = { "0.2.0", "TestMission", "VR", "Shakan", "1", "tmp/" };
    RVExtensionArgs( nullptr, 0, "start", args, 6 );
    return 0;
}
