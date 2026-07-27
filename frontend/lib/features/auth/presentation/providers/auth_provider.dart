import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/auth_user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/login_usecase.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) => AuthRepositoryImpl());

final loginUseCaseProvider = Provider(
  (ref) => LoginUseCase(ref.watch(authRepositoryProvider)),
);

/// Holds the currently authenticated user (null when signed out).
/// The router reads this to redirect between auth / customer / vendor / admin shells.
class AuthController extends StateNotifier<AsyncValue<AuthUser?>> {
  AuthController(this._ref) : super(const AsyncValue.data(null));
  final Ref _ref;

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    final result = await _ref.read(loginUseCaseProvider).call(email, password);
    state = result.fold(
      (failure) => AsyncValue.error(failure.message, StackTrace.current),
      (user) => AsyncValue.data(user),
    );
  }

  Future<void> logout() async {
    await _ref.read(authRepositoryProvider).logout();
    state = const AsyncValue.data(null);
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AsyncValue<AuthUser?>>(
  (ref) => AuthController(ref),
);
