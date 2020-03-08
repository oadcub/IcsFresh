namespace IcsFresh.OpenApi.Helper
{
    public class ErrorViewModels
    {
        public bool IsError { get; set; } = false;
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Detail { get; set; } = string.Empty;
        public string Api { get; set; } = string.Empty;
        public string Verb { get; set; } = string.Empty;
        public string StackTrace { get; set; } = string.Empty;
        public object ErrorObject { get; set; } = new object();
    }
}