import sys
import traceback


class FallbackCall:
    """
    A wrapper for a function that falls back to the last successful result and optionally handles exceptions.

    This allows you to safely call functions that may fail (e.g., API requests) 
    while keeping a cached last-successful value.

    Parameters:
        func: The function to wrap.
        debug (bool): If True, prints full traceback on exceptions.
        raise_on_error (bool): If True, propagates exceptions when the function fails.
        default_value (any): The default value to return if there are no successful results.
    
    Other attributes:
        last_successful_result: Stores the last successful result of `func`.
        fresh (bool): Indicates whether the returned result is from the current call (True) 
            or a fallback from a previous successful call (False).

    Usage:

        safe_get_members = FallbackCall(get_members)

        # Later in a view or task
        result, fresh = safe_get_members()
        if not fresh:
            print("Using cached last-successful result")
    """
    
    _last_successful_result = None
    _fresh = False

    def __init__(self, func, *, debug=False, raise_on_error=False, default_value=None):
        
        assert func is not None, "func must be provided"
        self.func = func
        
        self.raise_on_error = raise_on_error
        self.default_value = default_value
        self.debug = debug

    def __call__(self, *args, **kwargs):
        try:
            result = self.func(*args, **kwargs)
            self._last_successful_result = result
            self._fresh = True
            
        except Exception:
            self._fresh = False
            
            if self.raise_on_error:
                raise
            elif self.debug:
                traceback.print_exc()
            else:
                print(
                    Exception("Exception thrown while fetching github contributors"),
                    file=sys.stderr,
                )
            
            print("Returning last successful result instead of failing")
        
        return (
            self._last_successful_result or self.default_value, 
            self._fresh
        )
