#Licensed under the MIT license.

#Azure Connection and Execution Time Spent

#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
#WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#------------------------------------------------------------------------------
#About this PowerShell Script
#-------------------------------------------------------------------------------

# db name without the tcp at the front. 
Param($DatabaseServer = "nptfc-uk.database.windows.net",
      $Database = "",
      $Username = "",
      $passwordSecure = "" ,
      $NumberExecutions ="10",
      $Port="1433",
      $LogFile="c:\temp\Details.log")


#-------------------------------
#Delete the file
#-------------------------------
Function DeleteFile{ 
  Param( [Parameter(Mandatory)]$FileName ) 
  try
   {
    logMsg("Checking if the file..." + $FileName + " exists.") -SaveFile $false 
    if( FileExist($FileName))
    {
     logMsg("Removing the file..." + $FileName) -SaveFile $false   
     $Null = Remove-Item -Path $FileName -Force 
     logMsg("Removed the file..." + $FileName) -SaveFile $false  
    }
    return $true 
   }
  catch
  {
   logMsg("Remove the file..." + $FileName + " - " + $Error[0].Exception) (2) 
   return $false
  }
 }

#-----------------------------------------------------------
# Identify if the value is empty or not
#-----------------------------------------------------------

function TestEmpty($s)
{
if ([string]::IsNullOrWhitespace($s))
  {
    return $true;
  }
else
  {
    return $false;
  }
}

#-------------------------------
#File Exists
#-------------------------------
Function FileExist{ 
  Param( [Parameter(Mandatory)]$FileName ) 
  try
   {
    $return=$false
    $FileExists = Test-Path $FileName
    if($FileExists -eq $True)
    {
     $return=$true
    }
    return $return
   }
  catch
  {
   return $false
  }
 }


#--------------------------------
#Obtain the DNS details resolution.
#--------------------------------
function CheckDns($sReviewServer)
{
try
 {
    $IpAddress = [System.Net.Dns]::GetHostAddresses($sReviewServer)
    foreach ($Address in $IpAddress)
    {
        $sAddress = $sAddress + $Address.IpAddressToString + " ";
    }
    return $sAddress
    break;
 }
  catch
 {
  return ""
 }
}


#----------------------------------------------------------------
#Function to connect to the database using a retry-logic
#----------------------------------------------------------------

Function GiveMeConnectionSource()
{ 
  $lNumRetries=10
  for ($i=1; $i -le $lNumRetries; $i++)
  {
   try
    {

      logMsg( "-------------------------------------- " + "Connecting Attempt #" + $i + " of " + $lNumRetries.ToString() + " - IP:" + $(CheckDns($DatabaseServer)) + " ----------------------------------") (3)     
      
        $SQLConnection = New-Object System.Data.SqlClient.SqlConnection 
        $SQLConnection.ConnectionString = "data source=tcp:"+$DatabaseServer +"," + $Port
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";Initial Catalog="+$Database
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";Connection Timeout=30"
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";User ID="+ $Username
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";Password="+ $password
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";Application Name=Test SQLCLIENT Connection" 
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";Persist Security Info=False"
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";ConnectRetryInterval=3"
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";ConnectRetryInterval=10"
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";Max Pool Size=100"
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";Min Pool Size=1"
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";MultipleActiveResultSets=False"
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";Pooling=True"
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";Encrypt=True"
        $SQLConnection.ConnectionString = $SQLConnection.ConnectionString + ";TrustServerCertificate=False"
        
      $start = get-date
        $SQLConnection.Open()
      $end = get-date

      ##$sAdditionalInformation = " - ID:" + $SQLConnection.ClientConnectionId.ToString() ##+ " -- HostName: " + $SQLConnection.WorkstationId + " Server Version:" + $SQLConnection.ServerVersion

      $lDiff=(New-TimeSpan -Start $start -End $end).TotalMilliseconds

      $LatencyAndOthers.ConnectionsDone_Number_Success = $LatencyAndOthers.ConnectionsDone_Number_Success+1
      $LatencyAndOthers.ConnectionsDone_MS = $LatencyAndOthers.ConnectionsDone_MS+$lDiff

      logMsg("Connected (ms): " + $lDiff.ToString() ) (3)
      logMsg("Conn.Failed   : " + $LatencyAndOthers.ConnectionsDone_Number_Failed.ToString()) (3)
      logMsg("Conn.Success  : " + $LatencyAndOthers.ConnectionsDone_Number_Success.ToString()) (3) 
      logMsg("Conn.(ms)     : " + ($LatencyAndOthers.ConnectionsDone_MS / $LatencyAndOthers.ConnectionsDone_Number_Success).ToString()) (3)

      return $SQLConnection
      break;
    }
  catch
   {
    $LatencyAndOthers.ConnectionsDone_Number_Failed = $LatencyAndOthers.ConnectionsDone_Number_Failed +1
    logMsg("Not able to connect - Retrying the connection..." + $Error[0].Exception.ErrorRecord + "-" + $Error[0].Exception.ToString().Replace("\t"," ").Replace("\n"," ").Replace("\r"," ").Replace("\r\n","").Trim()) (2)
    $WaitTime = (5*($i+1))
    logMsg("Waiting for next retry in " + $WaitTime.ToString() + " seconds ..") -SaveFile $false 
    Start-Sleep -s $WaitTime
    [System.Data.SqlClient.SqlConnection]::ClearAllPools() 
   }
  }
}

#--------------------------------
#Verify if the value is able to convert to integer
#--------------------------------

Function IsInteger([string]$vInteger)
{
    Try
    {
        $null = [convert]::ToInt32($vInteger)
        return $True
    }
    Catch
    {
        return $False
    }
}  

#--------------------------------
#Log the operations
#--------------------------------
function logMsg
{
    Param
    (
         [Parameter(Mandatory=$false, Position=0)]
         [string] $msg,
         [Parameter(Mandatory=$false, Position=1)]
         [int] $Color,
         [Parameter(Mandatory=$false, Position=2)]
         [boolean] $Show=$true,
         [Parameter(Mandatory=$false, Position=3)]
         [boolean] $ShowDate=$true,
         [Parameter(Mandatory=$false, Position=4)]
         [boolean] $SaveFile=$true 
    )
  try
   {

    if($ShowDate -eq $true)
    {
      $msg = (Get-Date -format "yyyy-MM-dd HH:mm:ss.fff") + " " + $msg 
    }

    If($SaveFile -eq $true) 
    {
      Write-Output $msg | Out-File -FilePath $LogFile -Append
    }

 if($Show -eq $true)
  {
    $Colores="White"
    If($Color -eq 1 )     {$Colores ="Cyan"}
    elseIf($Color -eq 3 ) {$Colores ="Yellow"}
    elseIf($Color -eq 4 ) {$Colores ="Green"}
    elseIf($Color -eq 5 ) {$Colores ="Magenta"}
    If($Color -eq 2)
    {
         Write-Host -ForegroundColor White -BackgroundColor Red $msg 
    } 
    else 
    {
         Write-Host -ForegroundColor $Colores $msg 
    } 
   }
  }
  catch
  {
    Write-Host $msg 
  }
}

Class LatencyAndOthers #Class to manage the connection latency
{
 [long]$ConnectionsDone_MS = 0
 [long]$ConnectionsDone_Number_Success = 0
 [long]$ConnectionsDone_Number_Failed = 0
 [long]$ExecutionsDone_MS = 0
 [long]$ExecutionsDone_Number_Success = 0
 [long]$ExecutionsDone_Number_Failed = 0
}

Class QueryText #Query Text
{
 [string]$Text = ""
 [boolean]$ExecuteNonQuery = $false
 [boolean]$ExecuteReader = $false
 [boolean]$ExecuteScalar = $false
 [int]$CommandTimeout=30
}


$LatencyAndOthers = [LatencyAndOthers]::new()
$Query = [QueryText]::new()
[System.Collections.ArrayList]$IPArrayConnection = @()
[System.Collections.ArrayList]$Query = @()
[System.Collections.ArrayList]$CommandArray = @()
[System.Collections.ArrayList]$QueryMetrics = @()

cls

if (TestEmpty($DatabaseServer)) 
    { $DatabaseServer = read-host -Prompt "Please enter a Server Name" }

if (TestEmpty($DatabaseServer)) 
    { 
     logMsg ("Server Name is empty. Closing the application.") 
     exit;
    }

if (TestEmpty($Database))  
    { $Database = read-host -Prompt "Please enter a Database Name"  }

if (TestEmpty($Database)) 
     { 
      logMsg ("DatabaseName is empty. Closing the application.") 
      exit;
     }

if (TestEmpty($Port))  
    { $Port = read-host -Prompt "Please enter the port number, for example, 1433 "  }

if (TestEmpty($Port)) 
     { 
      logMsg ("Port is empty. Closing the application.") 
      exit;
     }

if (TestEmpty($Username))  
     { $Username = read-host -Prompt "Please enter a User Name"   }

if (TestEmpty($Username)) 
     { 
      logMsg ("User Name is empty. Closing the application.") 
       exit;
      }

if (TestEmpty($passwordSecure))  
    {  
    $passwordSecure = read-host -Prompt "Please enter a password"  -assecurestring  
    $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($passwordSecure))
    }
else
    {$password = $passwordSecure} 

if (TestEmpty($Password)) 
     { 
      logMsg ("Password is empty. Closing the application.") 
      exit;
     }

 if (TestEmpty($NumberExecutions)) 
   {
    $NumberExecutions = read-host -Prompt "Please enter the number of test to run (1-2000) - Leave this field empty and press enter for default value 10."
   }

if (TestEmpty($NumberExecutions)) 
     { 
       $NumberExecutions="10"
     }

 if( -not (IsInteger([string]$NumberExecutions)))
   {
    logMsg("Please, specify a correct number of process to run, the value is not integer") (2)
    exit;
   }


 $IntegerNumberExecutions = [int]::Parse($NumberExecutions)

 if($integerNumberExecutions -lt 1 -or $integerNumberExecutions -gt 20000)
   {
    logMsg("Please, specify a correct number of process to run, it is a value between 1 and 2000") (2)
    exit;
   }

  $QueryTmp = [QueryText]::new()
  $QueryTmp.Text = "SELECT * from GameStat;"
  $QueryTmp.ExecuteScalar=$true
  $Null = $Query.Add($QueryTmp)

if(TestEmpty($LogFile))
  {
        $FileBrowserAnalysis = New-Object System.Windows.Forms.SaveFileDialog -Property @{ 
        InitialDirectory = [Environment]::GetFolderPath("Desktop") 
        Title = 'Please choose the Log File to save the content of this process'
        Filter = 'Log File to save the content (*.*)|*.*'}
        $null = $FileBrowserAnalysis.ShowDialog()
        $LogFile = $FileBrowserAnalysis.FileName
        if(TestEmpty($LogFile))
        {
         logMsg -msg "File log was not selected" -Color 2 -bSaveOnFile $false
         exit;
        }
     }


  $Null = DeleteFile($LogFile)

  logMsg( "Details DB Connection: " + $DatabaseServer + " - DB: " + $Database + " HostName:" + $env:computername )


  foreach($Tmp in $Query) ##Create the same number of command that queries that we need.
  {
   $QueryMetricTmp = [LatencyAndOthers]::new()
   $Null = $QueryMetrics.add($QueryMetricTmp)
    $command = New-Object -TypeName System.Data.SqlClient.SqlCommand
    $command.CommandTimeout = $Tmp.CommandTimeout
    $command.CommandText = $Tmp.Text 
    $command.Prepare()
    $Null = $CommandArray.Add($command)
  }

  $QueryCount = $query.Count
  $bShowQuery = $true 
  $sw = [diagnostics.stopwatch]::StartNew() ##Take the time.

  for ($i=1; $i -le $IntegerNumberExecutions; $i++) ##For every number of process open a new connection and close it at the end.
  {
   try
    {

      $Null = $IPArrayConnection.Add($(GiveMeConnectionSource)) #Connecting to the database.
      if($IPArrayConnection[$i-1] -eq $null)
      { 
          LogMsg("Not able to connect. Closing the application...") (2) 
          exit;
      }
     
 
     for ($iQuery=0; $iQuery -lt $QueryCount; $iQuery++) #for Every query run it. 
     {
       $CommandArray[$iQuery].Connection = $IPArrayConnection[$i-1] 

       Try
       {
         $lDiff=0
         LogMsg( "----------------------- Query Iteration:" + $i + " Query " + ($iQuery+1).ToString() + "/" + $QueryCount + " ---------------------------------------------------------" )
         if($bShowQuery -eq $true) ##There is not needed to report the same and unique query multiple time and also we're saving time.
         {
           LogMsg( $query[$iQuery].Text ) 
           if( $query[$iQuery].ExecuteNonQuery -eq $true )
           {
             LogMsg( "Type command: ExecuteNonQuery")
           }
           if( $query[$iQuery].ExecuteScalar -eq $true )
           {
            LogMsg( "Type command: ExecuteScalar")
           }
           if( $query[$iQuery].ExecuteReader -eq $true )
           {
             LogMsg( "Type command: ExecuteReader")
           }

           $bShowQuery=(-not ($QueryCount -eq 1))
         }
         
         $start = get-date
           $IPArrayConnection[$i-1].StatisticsEnabled = 1
           if( $query[$iQuery].ExecuteNonQuery -eq $true ) { $Null = $CommandArray[$iQuery].ExecuteNonQuery() }
           if( $query[$iQuery].ExecuteScalar -eq $true ) { $Null = $CommandArray[$iQuery].ExecuteScalar() }
           if( $query[$iQuery].ExecuteReader -eq $true ) { $Null = $CommandArray[$iQuery].ExecuteReader() }
           $data = $IPArrayConnection[$i-1].RetrieveStatistics()
           $Null = $IPArrayConnection[$i-1].StatisticsEnabled = 0
           $Null = $IPArrayConnection[$i-1].ResetStatistics()
         $end = get-date

         $lDiff=(New-TimeSpan -Start $start -End $end).TotalMilliseconds
         $QueryMetrics[$iQuery].ExecutionsDone_Number_Success = $QueryMetrics[$iQuery].ExecutionsDone_Number_Success+1
         $QueryMetrics[$iQuery].ExecutionsDone_MS = $QueryMetrics[$iQuery].ExecutionsDone_MS+$lDiff
         
         $LatencyAndOthers.ExecutionsDone_Number_Success = $LatencyAndOthers.ExecutionsDone_Number_Success+1
         $LatencyAndOthers.ExecutionsDone_MS = $LatencyAndOthers.ExecutionsDone_MS+$lDiff
         LogMsg( "Time required (ms)    : " + $lDiff.ToString()) 
       }
       catch
       {
         $LatencyAndOthers.ExecutionsDone_Number_Failed = $LatencyAndOthers.ExecutionsDone_Number_Failed+1
         $QueryMetrics[$iQuery].ExecutionsDone_Number_Failed = $QueryMetrics[$iQuery].ExecutionsDone_Number_Failed+1
         LogMsg( "Error: " + $Error[0].Exception) (2)
       }
               
        LogMsg( "NetworkServerTime (ms): " +$data.NetworkServerTime ) 
        LogMsg( "Execution Time (ms)   : " +$data.ExecutionTime) 
        LogMsg( "ServerRoundTrips      : " +$data.ServerRoundtrips)
        LogMsg( "SelectRows            : " +$data.SelectRows) 
        ##LogMsg( "BytesSent             : " +$data.BytesSent) 
        ##LogMsg( "BytesReceived         : " +$data.BytesReceived) 
        ##LogMsg( "Connection Time (ms)  : " +$data.ConnectionTime) 
        ##LogMsg( "BuffersReceived       : " +$data.BuffersReceived) 
        ##LogMsg( "SelectCount           : " +$data.SelectCount) 

        logMsg( "Query Commands Failed : " + $QueryMetrics[$iQuery].ExecutionsDone_Number_Failed.ToString())
        logMsg( "Query Commands Success: " + $QueryMetrics[$iQuery].ExecutionsDone_Number_Success.ToString())
        logMsg( "Query Commands ms     : " + ($QueryMetrics[$iQuery].ExecutionsDone_MS / $QueryMetrics[$iQuery].ExecutionsDone_Number_Success).ToString())

        logMsg( "Total Commands Failed : " + $LatencyAndOthers.ExecutionsDone_Number_Failed.ToString())
        logMsg( "Total Commands Success: " + $LatencyAndOthers.ExecutionsDone_Number_Success.ToString())
        logMsg( "Total Commands ms     : " + ($LatencyAndOthers.ExecutionsDone_MS / $LatencyAndOthers.ExecutionsDone_Number_Success).ToString())

      }
      $IPArrayConnection[$i-1].Close() ##Close the connection.
     }
    catch
   {
    LogMsg( "Error: " + $Error[0].Exception) (2)
   }
   
}

logMsg("-------------------------------------- SUMMARY -----------------------------------------------------------------")
logMsg("Total Connections Failed : " + $LatencyAndOthers.ConnectionsDone_Number_Failed.ToString())
logMsg("Total Connections Success: " + $LatencyAndOthers.ConnectionsDone_Number_Success.ToString())
logMsg("Total Connections Avg ms : " + ($LatencyAndOthers.ConnectionsDone_MS / $LatencyAndOthers.ConnectionsDone_Number_Success).ToString())
LogMsg("Total Number Executions  : " + $IntegerNumberExecutions) 
LogMsg("Total Number Queries     : " + $QueryCount) 
LogMsg("Total Number Process     : " + ($IntegerNumberExecutions*$query.Count)) 
logMsg("Total Commands Failed    : " + $LatencyAndOthers.ExecutionsDone_Number_Failed.ToString())
logMsg("Total Commands Success   : " + $LatencyAndOthers.ExecutionsDone_Number_Success.ToString())
logMsg("Total Commands ms        : " + ($LatencyAndOthers.ExecutionsDone_MS / $LatencyAndOthers.ExecutionsDone_Number_Success).ToString())
$i=0
LogMsg("------------------- Queries Summary -------------------------------")
foreach($Tmp in $Query) ##Create the same number of command that queries that we need.
{
 LogMsg("Query #               : " + $Tmp.Text)
 logMsg("Total Commands Failed : " + $QueryMetrics[$i].ExecutionsDone_Number_Failed.ToString())
 logMsg("Total Commands Success: " + $QueryMetrics[$i].ExecutionsDone_Number_Success.ToString())
 logMsg("Total Commands ms     : " + ($QueryMetrics[$i].ExecutionsDone_MS / $QueryMetrics[$i].ExecutionsDone_Number_Success).ToString())
 $i=$i+1
}


LogMsg( "Review: https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/sql/provider-statistics-for-sql-server") 
LogMsg("Time spent (ms) Procces :  " +$sw.elapsed) 
logMsg("-------------------------------------- SUMMARY -----------------------------------------------------------------")
Remove-Variable passwordSecure
Remove-Variable password