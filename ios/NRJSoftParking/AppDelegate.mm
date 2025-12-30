#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <GoogleMaps/GoogleMaps.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSString *mapsApiKey = [[NSProcessInfo processInfo] environment][@"GOOGLE_MAPS_API_KEY"];
  if (!mapsApiKey) {
    mapsApiKey = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"GMSServicesApiKey"];
  }
  if (mapsApiKey) {
    [GMSServices provideAPIKey:mapsApiKey];
  }
  self.moduleName = @"NRJSoftParking";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
