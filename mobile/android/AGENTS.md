# Android Uygulama — Hava Durumu & Don Uyarisi

## Stack
- Kotlin 2.0+, Jetpack Compose, MVVM + Hilt, min SDK 26
- Retrofit + OkHttp, EncryptedSharedPreferences, FCM push

## API Base URL
```
https://api.hava.agro.com.tr/api/v1
```

## Proje Yapisi
```
app/src/main/java/com/agro/hava/
├── App.kt                     @HiltAndroidApp
├── MainActivity.kt
├── core/
│   ├── network/
│   │   ├── ApiClient.kt       Retrofit instance
│   │   ├── ApiService.kt      interface @GET/@POST
│   │   ├── AuthInterceptor.kt OkHttp interceptor (token inject)
│   │   └── ApiResponse.kt     sealed class
│   ├── auth/
│   │   ├── AuthManager.kt
│   │   └── TokenStorage.kt    EncryptedSharedPreferences
│   └── di/
│       ├── AppModule.kt       @Provides Retrofit, OkHttp
│       └── RepositoryModule.kt
├── features/
│   ├── weather/
│   │   ├── ui/
│   │   │   ├── WeatherScreen.kt
│   │   │   ├── ForecastCard.kt
│   │   │   └── FrostAlertBanner.kt
│   │   ├── WeatherViewModel.kt
│   │   └── WeatherRepository.kt
│   ├── locations/
│   │   ├── ui/LocationListScreen.kt
│   │   ├── LocationViewModel.kt
│   │   └── LocationRepository.kt
│   └── settings/
│       └── ui/SettingsScreen.kt
├── models/
│   ├── WeatherForecast.kt
│   ├── FrostRisk.kt
│   ├── Location.kt
│   └── ApiResponse.kt
└── res/
    ├── values/strings.xml     (Turkce)
    └── values-en/strings.xml  (Ingilizce)
```

## API Modelleri

```kotlin
@Serializable
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val error: ApiErrorDetail? = null
)

@Serializable
data class WeatherForecast(
    val id: String,
    val date: String,
    val tempMin: Double,
    val tempMax: Double,
    val humidity: Int,
    val condition: String,
    val icon: String,
    val frostRisk: Int
)

@Serializable
data class FrostRiskResponse(
    val maxRisk: Int,
    val riskDays: List<FrostRiskDay>
)

@Serializable
data class Location(
    val id: String,
    val name: String,
    val slug: String,
    val city: String?,
    val region: String?
)
```

## ApiService Interface

```kotlin
interface ApiService {
    @GET("weather")
    suspend fun getWeather(
        @Query("lat") lat: Double,
        @Query("lon") lon: Double,
        @Query("days") days: Int = 7
    ): ApiResponse<WeatherResult>

    @GET("weather/frost-risk")
    suspend fun getFrostRisk(@Query("location") location: String): ApiResponse<FrostRiskResponse>

    @GET("weather/widget-data")
    suspend fun getWidgetData(@Query("location") location: String): ApiResponse<WidgetData>

    @GET("locations")
    suspend fun getLocations(): PaginatedResponse<Location>

    @POST("auth/login")
    suspend fun login(@Body body: LoginBody): ApiResponse<LoginResponse>
}
```

## Kurallar
- Jetpack Compose ZORUNLU — XML layout YASAK
- MVVM: Screen → ViewModel → Repository → ApiService
- Token: EncryptedSharedPreferences, plain SharedPreferences YASAK
- Coroutine: viewModelScope.launch, GlobalScope YASAK
- State: StateFlow + collectAsStateWithLifecycle()
- DI: Hilt, manuel instance YASAK
- i18n: strings.xml, hard-coded metin YASAK
