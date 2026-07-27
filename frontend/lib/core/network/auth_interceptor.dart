import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Attaches the bearer access token to every request, and on a 401
/// transparently refreshes the token once before retrying the original call.
class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._dio, this._storage);

  final Dio _dio;
  final FlutterSecureStorage _storage;
  static const _accessTokenKey = 'pepto_access_token';
  static const _refreshTokenKey = 'pepto_refresh_token';

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.read(key: _accessTokenKey);
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final refreshToken = await _storage.read(key: _refreshTokenKey);
      if (refreshToken != null) {
        try {
          final response = await _dio.post(
            '/auth/refresh',
            data: {'refreshToken': refreshToken},
          );
          final newAccessToken = response.data['data']['accessToken'] as String;
          await _storage.write(key: _accessTokenKey, value: newAccessToken);

          final retryRequest = err.requestOptions;
          retryRequest.headers['Authorization'] = 'Bearer $newAccessToken';
          final retryResponse = await _dio.fetch(retryRequest);
          return handler.resolve(retryResponse);
        } catch (_) {
          await _storage.delete(key: _accessTokenKey);
          await _storage.delete(key: _refreshTokenKey);
          // TODO: trigger navigation back to login (e.g. via a router redirect
          // listening to an auth-state provider)
        }
      }
    }
    handler.next(err);
  }
}
