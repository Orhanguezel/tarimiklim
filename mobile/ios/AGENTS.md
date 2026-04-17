# iOS Uygulama — Hava Durumu & Don Uyarisi

## Stack
- Swift 6+, SwiftUI, MVVM, min iOS 17
- URLSession + async/await, Keychain (token), APNs (push)

## API Base URL
```
https://api.hava.agro.com.tr/api/v1
```

## Proje Yapisi
```
HavaDurumu/
├── App/
│   ├── HavaDurumuApp.swift       @main entry
│   └── ContentView.swift
├── Core/
│   ├── Network/
│   │   ├── APIClient.swift       fetch wrapper, token injection
│   │   ├── APIEndpoints.swift    Endpoint enum
│   │   └── APIError.swift        NetworkError types
│   ├── Auth/
│   │   ├── AuthManager.swift     login/logout/refresh
│   │   └── KeychainHelper.swift  token storage
│   └── Extensions/
├── Features/
│   ├── Weather/
│   │   ├── WeatherView.swift
│   │   ├── WeatherViewModel.swift
│   │   ├── ForecastCardView.swift
│   │   └── FrostAlertView.swift
│   ├── Locations/
│   │   ├── LocationListView.swift
│   │   └── LocationViewModel.swift
│   └── Settings/
│       └── SettingsView.swift
├── Models/
│   ├── WeatherForecast.swift
│   ├── FrostRisk.swift
│   ├── Location.swift
│   └── APIResponse.swift
└── Resources/
    ├── Assets.xcassets
    └── Localizable.xcstrings   (tr, en)
```

## API Modelleri

```swift
struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let error: APIErrorDetail?
}

struct WeatherForecast: Codable, Identifiable {
    let id: String
    let date: String
    let tempMin: Double
    let tempMax: Double
    let humidity: Int
    let condition: String
    let icon: String
    let frostRisk: Int
}

struct FrostRiskResponse: Codable {
    let maxRisk: Int
    let riskDays: [FrostRiskDay]
}

struct Location: Codable, Identifiable {
    let id: String
    let name: String
    let slug: String
    let city: String?
    let region: String?
}
```

## Endpoint Enum

```swift
enum Endpoint {
    case weather(lat: Double, lon: Double, days: Int)
    case currentWeather(lat: Double, lon: Double)
    case frostRisk(location: String)
    case widgetData(location: String)
    case locations
    case login
    case me

    var path: String {
        switch self {
        case .weather: return "/weather"
        case .currentWeather: return "/weather/current"
        case .frostRisk: return "/weather/frost-risk"
        case .widgetData: return "/weather/widget-data"
        case .locations: return "/locations"
        case .login: return "/auth/login"
        case .me: return "/auth/user"
        }
    }
}
```

## Kurallar
- View'da is mantigi YASAK — ViewModel'e tasiy
- Token: Keychain'de sakla (kSecClassGenericPassword)
- Network: async/await, completion handler YASAK
- Force unwrap `!` YASAK
- i18n: String(localized:) kullan
- Dark mode: Assets.xcassets semantic renk
