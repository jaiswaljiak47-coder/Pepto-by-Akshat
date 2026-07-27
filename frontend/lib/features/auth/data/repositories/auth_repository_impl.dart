import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/api_client.dart';
import '../../domain/entities/auth_user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../models/auth_user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({Dio? dio, FlutterSecureStorage? storage})
      : _dio = dio ?? ApiClient.instance.dio,
        _storage = storage ?? const FlutterSecureStorage();

  final Dio _dio;
  final FlutterSecureStorage _storage;

  @override
  Future<Either<Failure, AuthUser>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      return Right(await _persistAndReturn(response.data['data']));
    } on DioException catch (e) {
      return Left(ServerFailure(_extractMessage(e)));
    }
  }

  @override
  Future<Either<Failure, AuthUser>> register(
    String fullName,
    String email,
    String password,
  ) async {
    try {
      final response = await _dio.post(
        '/auth/register',
        data: {'fullName': fullName, 'email': email, 'password': password},
      );
      return Right(await _persistAndReturn(response.data['data']));
    } on DioException catch (e) {
      return Left(ServerFailure(_extractMessage(e)));
    }
  }

  @override
  Future<void> logout() async {
    await _storage.deleteAll();
  }

  @override
  Future<AuthUser?> currentUser() async {
    // TODO: decode stored JWT or call GET /users/me to hydrate on app start
    return null;
  }

  Future<AuthUser> _persistAndReturn(Map<String, dynamic> data) async {
    await _storage.write(key: 'pepto_access_token', value: data['accessToken']);
    await _storage.write(key: 'pepto_refresh_token', value: data['refreshToken']);
    return AuthUserModel.fromJson(data['user']);
  }

  String _extractMessage(DioException e) {
    return e.response?.data?['message']?.toString() ?? 'Something went wrong';
  }
}
