# App Store Guideline 2.1 – Camera Crash Fix (Profile Picture)

## 1. Why the app can crash when opening the camera for profile picture

| Cause | Explanation |
|-------|-------------|
| **Missing Info.plist usage descriptions** | iOS requires `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription`. If missing, the app can crash when accessing the camera or photo library. |
| **Permission requested too late** | Requesting permission only when the user taps "Take photo" can lead to a crash if the system dialog fails or the app is not prepared for denial. |
| **No error handling** | If `UIImagePickerController` / `PHPickerViewController` fails (e.g. simulator without camera, permission denied), unhandled errors can crash the app. |
| **iPad: missing popover source** | On iPad, presenting `UIImagePickerController` or an action sheet without `popoverPresentationController.sourceView` causes a crash. |
| **Image picker lifecycle** | Dismissing the picker or releasing it incorrectly can crash. |
| **WebView / hybrid (Capacitor)** | The web `<input type="file" accept="image/*">` triggers the native picker; if the native iOS project does not declare camera/photo usage in Info.plist, the app can crash. |
| **Simulator / no camera** | Using camera on simulator or a device without camera without checking `isSourceTypeAvailable` can crash. |

---

## 2. Common causes checklist

- [ ] **Missing camera permission in Info.plist** – Add `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription`.
- [ ] **Incorrect picker implementation** – Not checking `isSourceTypeAvailable(.camera)` before presenting; not using `PHPickerViewController` on iOS 14+ for photos.
- [ ] **No handling when access is denied** – App must handle denied/restricted and show a message or fallback (e.g. "Open Settings to allow camera").
- [ ] **iPad compatibility** – On iPad, set `popoverPresentationController?.sourceView` and `sourceRect` when presenting picker or action sheet.
- [ ] **Image picker library** – Third-party libraries may not set popover on iPad; update or use native implementation.
- [ ] **Memory / large images** – Loading a huge image without downscaling can cause memory pressure and crash.

---

## 3. Info.plist configuration for camera and photo library

Add these keys to your **iOS app Info.plist** (e.g. `ios/App/App/Info.plist` for Capacitor):

```xml
<key>NSCameraUsageDescription</key>
<string>نحتاج إلى الكاميرا لالتقاط صورة للملف الشخصي.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>نحتاج إلى الصور لاختيار صورة للملف الشخصي.</string>
```

If you also save photos to the library:

```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>حفظ الصورة في مكتبة الصور.</string>
```

---

## 4. Safe implementation (native iOS – Swift)

### Check camera availability and request permission

```swift
import AVFoundation
import UIKit
import PhotosUI

// Before presenting camera:
if !UIImagePickerController.isSourceTypeAvailable(.camera) {
    // Show "Choose from library" only, or alert that camera is unavailable
    presentPhotoLibraryPicker()
    return
}

switch AVCaptureDevice.authorizationStatus(for: .video) {
case .authorized:
    presentImagePicker(sourceType: .camera)
case .notDetermined:
    AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
        DispatchQueue.main.async {
            if granted { self?.presentImagePicker(sourceType: .camera) }
            else { self?.showPermissionDeniedMessage(for: "الكاميرا") }
        }
    }
case .denied, .restricted:
    showPermissionDeniedMessage(for: "الكاميرا")
@unknown default:
    showPermissionDeniedMessage(for: "الكاميرا")
}
```

### iPad: set popover to avoid crash

```swift
let picker = UIImagePickerController()
picker.sourceType = .camera
picker.delegate = self
if let popover = picker.popoverPresentationController {
    popover.sourceView = view
    popover.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 0, height: 0)
}
present(picker, animated: true)
```

Same for `UIAlertController(style: .actionSheet)` – always set `popoverPresentationController?.sourceView` and `sourceRect` (or `barButtonItem`) on iPad.

### Show "Open Settings" when permission denied

```swift
func showPermissionDeniedMessage(for feature: String) {
    let alert = UIAlertController(
        title: "السماح بـ \(feature)",
        message: "يرجى تفعيل \(feature) من الإعدادات لاستخدام هذه الميزة.",
        preferredStyle: .alert
    )
    alert.addAction(UIAlertAction(title: "فتح الإعدادات", style: .default) { _ in
        if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
        }
    })
    alert.addAction(UIAlertAction(title: "إلغاء", style: .cancel))
    present(alert, animated: true)
}
```

---

## 5. Permission handling and fallback

1. **Before opening camera** – Check `AVCaptureDevice.authorizationStatus(for: .video)`. If `.notDetermined`, call `requestAccess`. If `.denied` or `.restricted`, show an alert with option to open Settings (`UIApplication.openSettingsURLString`).
2. **Photo library** – Use `PHPickerViewController` on iOS 14+ for read-only access; still declare `NSPhotoLibraryUsageDescription` in Info.plist.
3. **Fallback** – If camera is not available (simulator, denied), only show "Choose from library" or a clear message.

---

## 6. iPhone and iPad

- **iPad** – When presenting `UIImagePickerController` or `UIAlertController(style: .actionSheet)`, set `popoverPresentationController?.sourceView` and `sourceRect` (or `barButtonItem`). Otherwise the app can crash on iPad.
- **iPhone** – Action sheet and full-screen picker work without popover. Still check `isSourceTypeAvailable(.camera)` and handle permission denial.
- **Universal** – Use the same flow; only the popover configuration is iPad-specific.

---

## 7. Best practices to avoid App Store rejection

1. Always add `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` in Info.plist when using camera or photo library.
2. Check `isSourceTypeAvailable` before presenting the camera.
3. Handle permission denied and restricted; show an alert and optionally open Settings.
4. On iPad, set `popoverPresentationController.sourceView` (and `sourceRect` or barButtonItem) for any presented controller that can be a popover.
5. Offer photo library as fallback when camera is unavailable or denied.
6. Downscale large images before upload to avoid memory issues.
7. Test on a real iPad (e.g. iPad Air 11-inch) and with permission denied.
8. Do not assume camera is always available.

---

## 8. Checklist before resubmitting to App Store

- [ ] **Info.plist** – `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` are set with clear Arabic text.
- [ ] **iPad** – Any presentation that can be a popover (image picker, action sheet) has `popoverPresentationController?.sourceView` and `sourceRect` set.
- [ ] **Camera availability** – Check `UIImagePickerController.isSourceTypeAvailable(.camera)` before presenting camera.
- [ ] **Permissions** – Handle `.denied` and `.restricted`; show message and option to open Settings. Do not crash.
- [ ] **Cancel** – Implement `imagePickerControllerDidCancel` and dismiss without crash.
- [ ] **Real device** – Test on real iPhone and iPad (e.g. iPad Air 11-inch).
- [ ] **Simulator** – Test with camera disabled and with permission denied; app must not crash.
- [ ] **WebView / Capacitor** – If the app is a wrapped web app, add the same Info.plist keys to the native iOS project. Ensure the web avatar flow does not throw unhandled errors (see hardened `handleAvatarChange` in `app/account/page.tsx`).

---

## If you use Capacitor to wrap this Next.js app (done in this project)

1. **Done:** `ios` platform added (`npx cap add ios`).
2. **Done:** `ios/App/App/Info.plist` already contains `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` with Arabic text.
3. Build: run `npm run build` (produces `out/`), then `npx cap sync ios`. Open `ios/App/App.xcworkspace` in Xcode and run on a real iPad.
4. The web account page uses a defensive avatar handler (Promise-based FileReader, error handling, input reset) so that unhandled exceptions do not crash the WebView.
5. **iPad popover:** In a Capacitor WebView app, `<input type="file" accept="image/*">` is presented by the system; the system usually handles iPad presentation. If you still see a crash on iPad when choosing camera, consider using `@capacitor/camera` plugin which sets the popover correctly.

## What was fixed in this project (web layer)

- **`app/account/page.tsx`** – `handleAvatarChange` now uses a Promise-based `FileReader` with `onerror`, updates profile via `setProfile(prev => ...)`, resets the file input in `finally`, and shows a clear alert on error. This reduces the risk of crashes when the app runs in a WebView (e.g. Capacitor) on iOS.
