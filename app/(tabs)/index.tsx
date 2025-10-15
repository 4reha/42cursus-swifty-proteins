import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        isAuthenticated && user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.githubHeaderImage}
          />
        ) : (
          <Image
            source={require('@/assets/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        )
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* App Information */}
      <ThemedView style={styles.appInfoContainer}>
        <View style={styles.appHeader}>
          <Ionicons name="flask" size={32} color="#4A90E2" />
          <View style={styles.appTitleContainer}>
            <ThemedText type="subtitle" style={styles.appTitle}>Swifty Protein</ThemedText>
            <ThemedText style={styles.appSubtitle}>42 School Project</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.appDescription}>
          A powerful protein visualization and analysis tool for researchers and students.
        </ThemedText>
      </ThemedView>

      {/* GitHub Connection Prompt for Password Users */}
      {isAuthenticated && user && user.authMethod === 'password' && (
        <ThemedView style={styles.githubConnectionPrompt}>
          <View style={styles.githubPromptHeader}>
            <Ionicons name="logo-github" size={24} color="#4A90E2" />
            <ThemedText type="subtitle" style={styles.githubPromptTitle}>Connect GitHub</ThemedText>
          </View>
          <ThemedText style={styles.githubPromptDescription}>
            Connect your GitHub account to unlock advanced features, view your repositories, and get personalized insights.
          </ThemedText>
          <TouchableOpacity
            style={styles.githubConnectButton}
            onPress={() => {
              // TODO: Implement GitHub connection for existing password users
            }}
          >
            <Ionicons name="logo-github" size={16} color="#fff" />
            <ThemedText style={styles.githubConnectText}>Connect GitHub</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* User Information Display */}
      {isAuthenticated && user && (
        <ThemedView style={styles.userInfoContainer}>
          <View style={styles.userCard}>
            <View style={styles.userDetails}>
              <View style={styles.userHeader}>
                <ThemedText type="defaultSemiBold" style={styles.username}>
                  {user.githubData?.name || user.username}
                </ThemedText>
              </View>

              <ThemedText style={styles.userEmail}>
                {user.email}
              </ThemedText>

              {user.githubData?.bio && (
                <ThemedText style={styles.userBio}>
                  {user.githubData.bio}
                </ThemedText>
              )}

              {user.githubData?.location && (
                <View style={styles.userLocation}>
                  <Ionicons name="location-outline" size={14} color="#666" />
                  <ThemedText style={styles.locationText}>
                    {user.githubData.location}
                  </ThemedText>
                </View>
              )}

              <View style={styles.authMethodContainer}>
                <View style={styles.authMethodBadge}>
                  <Ionicons
                    name={user.authMethod === 'github' ? 'logo-github' : 'lock-closed'}
                    size={14}
                    color="#4A90E2"
                  />
                  <ThemedText style={styles.authMethod}>
                    {user.authMethod === 'github' ? 'GitHub' : 'Password'}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.userStats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <ThemedText style={styles.statText}>Active Session</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#4CAF50" />
                  <ThemedText style={styles.statText}>Secure</ThemedText>
                </View>
              </View>

              {user.githubData && (
                <View style={styles.githubStats}>
                  <View style={styles.githubStatItem}>
                    <Ionicons name="git-branch-outline" size={16} color="#4A90E2" />
                    <ThemedText style={styles.githubStatNumber}>
                      {user.githubData.public_repos || 0}
                    </ThemedText>
                    <ThemedText style={styles.githubStatLabel}>Repos</ThemedText>
                  </View>
                  <View style={styles.githubStatItem}>
                    <Ionicons name="people-outline" size={16} color="#4A90E2" />
                    <ThemedText style={styles.githubStatNumber}>
                      {user.githubData.followers || 0}
                    </ThemedText>
                    <ThemedText style={styles.githubStatLabel}>Followers</ThemedText>
                  </View>
                  <View style={styles.githubStatItem}>
                    <Ionicons name="person-add-outline" size={16} color="#4A90E2" />
                    <ThemedText style={styles.githubStatNumber}>
                      {user.githubData.following || 0}
                    </ThemedText>
                    <ThemedText style={styles.githubStatLabel}>Following</ThemedText>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ThemedView>
      )}

      {/* GitHub Profile Information */}
      {isAuthenticated && user && user.githubData && (
        <ThemedView style={styles.githubProfileContainer}>
          <View style={styles.githubProfileHeader}>
            <Ionicons name="logo-github" size={24} color="#4A90E2" />
            <ThemedText type="subtitle" style={styles.githubProfileTitle}>GitHub Profile</ThemedText>
          </View>

          <View style={styles.githubProfileInfo}>
            {user.githubData.bio && (
              <View style={styles.githubInfoItem}>
                <Ionicons name="document-text-outline" size={16} color="#666" />
                <ThemedText style={styles.githubInfoText}>{user.githubData.bio}</ThemedText>
              </View>
            )}

            {user.githubData.location && (
              <View style={styles.githubInfoItem}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <ThemedText style={styles.githubInfoText}>{user.githubData.location}</ThemedText>
              </View>
            )}

            {user.githubData.company && (
              <View style={styles.githubInfoItem}>
                <Ionicons name="business-outline" size={16} color="#666" />
                <ThemedText style={styles.githubInfoText}>{user.githubData.company}</ThemedText>
              </View>
            )}

            {user.githubData.blog && (
              <View style={styles.githubInfoItem}>
                <Ionicons name="link-outline" size={16} color="#666" />
                <ThemedText style={styles.githubInfoText}>{user.githubData.blog}</ThemedText>
              </View>
            )}
          </View>
        </ThemedView>
      )}

      {/* Features Overview */}
      <ThemedView style={styles.featuresContainer}>
        <ThemedText type="subtitle">Key Features</ThemedText>
        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            <Ionicons name="eye-outline" size={24} color="#4A90E2" />
            <ThemedText style={styles.featureTitle}>3D Visualization</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Interactive 3D protein structure viewing
            </ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="analytics-outline" size={24} color="#4A90E2" />
            <ThemedText style={styles.featureTitle}>Analysis Tools</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Advanced protein analysis and comparison
            </ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="cloud-outline" size={24} color="#4A90E2" />
            <ThemedText style={styles.featureTitle}>Cloud Sync</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Sync your work across devices
            </ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="people-outline" size={24} color="#4A90E2" />
            <ThemedText style={styles.featureTitle}>Collaboration</ThemedText>
            <ThemedText style={styles.featureDescription}>
              Share and collaborate on projects
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* GitHub Statistics */}
      {isAuthenticated && user && user.githubData && (
        <ThemedView style={styles.githubStatsContainer}>
          <ThemedText type="subtitle">GitHub Statistics</ThemedText>
          <View style={styles.githubStatsGrid}>
            <View style={styles.githubStatCard}>
              <Ionicons name="git-branch-outline" size={24} color="#4A90E2" />
              <ThemedText style={styles.githubStatNumber}>{user.githubData.public_repos || 0}</ThemedText>
              <ThemedText style={styles.githubStatLabel}>Public Repos</ThemedText>
            </View>
            <View style={styles.githubStatCard}>
              <Ionicons name="people-outline" size={24} color="#4A90E2" />
              <ThemedText style={styles.githubStatNumber}>{user.githubData.followers || 0}</ThemedText>
              <ThemedText style={styles.githubStatLabel}>Followers</ThemedText>
            </View>
            <View style={styles.githubStatCard}>
              <Ionicons name="person-add-outline" size={24} color="#4A90E2" />
              <ThemedText style={styles.githubStatNumber}>{user.githubData.following || 0}</ThemedText>
              <ThemedText style={styles.githubStatLabel}>Following</ThemedText>
            </View>
            <View style={styles.githubStatCard}>
              <Ionicons name="code-slash-outline" size={24} color="#4A90E2" />
              <ThemedText style={styles.githubStatNumber}>{user.githubData.public_gists || 0}</ThemedText>
              <ThemedText style={styles.githubStatLabel}>Gists</ThemedText>
            </View>
          </View>
        </ThemedView>
      )}

      {/* Recent Repositories */}
      {isAuthenticated && user && user.githubData?.recent_repos && user.githubData.recent_repos.length > 0 && (
        <ThemedView style={styles.recentReposContainer}>
          <ThemedText type="subtitle">Recent Repositories</ThemedText>
          <View style={styles.reposList}>
            {user.githubData.recent_repos.slice(0, 3).map((repo: any, index: number) => (
              <View key={index} style={styles.repoItem}>
                <View style={styles.repoHeader}>
                  <Ionicons name="folder-outline" size={16} color="#4A90E2" />
                  <ThemedText style={styles.repoName}>{repo.name}</ThemedText>
                  {repo.private && (
                    <Ionicons name="lock-closed" size={12} color="#666" />
                  )}
                </View>
                {repo.description && (
                  <ThemedText style={styles.repoDescription}>{repo.description}</ThemedText>
                )}
                <View style={styles.repoStats}>
                  <View style={styles.repoStatItem}>
                    <Ionicons name="star-outline" size={12} color="#FFD700" />
                    <ThemedText style={styles.repoStatText}>{repo.stargazers_count || 0}</ThemedText>
                  </View>
                  <View style={styles.repoStatItem}>
                    <Ionicons name="git-branch-outline" size={12} color="#666" />
                    <ThemedText style={styles.repoStatText}>{repo.forks_count || 0}</ThemedText>
                  </View>
                  <View style={styles.repoStatItem}>
                    <Ionicons name="code-outline" size={12} color="#666" />
                    <ThemedText style={styles.repoStatText}>{repo.language || 'No language'}</ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ThemedView>
      )}

      {/* Organizations */}
      {isAuthenticated && user && user.githubData?.organizations && user.githubData.organizations.length > 0 && (
        <ThemedView style={styles.organizationsContainer}>
          <ThemedText type="subtitle">Organizations</ThemedText>
          <View style={styles.organizationsList}>
            {user.githubData.organizations.slice(0, 4).map((org: any, index: number) => (
              <View key={index} style={styles.orgItem}>
                <Image
                  source={{ uri: org.avatar_url }}
                  style={styles.orgAvatar}
                />
                <View style={styles.orgInfo}>
                  <ThemedText style={styles.orgName}>{org.login}</ThemedText>
                  <ThemedText style={styles.orgDescription}>{org.description || 'Organization'}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        </ThemedView>
      )}

      {/* Starred Repositories */}
      {isAuthenticated && user && user.githubData?.starred_repos && user.githubData.starred_repos.length > 0 && (
        <ThemedView style={styles.starredReposContainer}>
          <ThemedText type="subtitle">Recently Starred</ThemedText>
          <View style={styles.starredList}>
            {user.githubData.starred_repos.slice(0, 3).map((repo: any, index: number) => (
              <View key={index} style={styles.starredItem}>
                <View style={styles.starredHeader}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <ThemedText style={styles.starredName}>{repo.full_name}</ThemedText>
                </View>
                {repo.description && (
                  <ThemedText style={styles.starredDescription}>{repo.description}</ThemedText>
                )}
                <View style={styles.starredStats}>
                  <ThemedText style={styles.starredLanguage}>{repo.language || 'No language'}</ThemedText>
                  <ThemedText style={styles.starredStars}>⭐ {repo.stargazers_count || 0}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        </ThemedView>
      )}

      {/* Quick Actions */}
      <ThemedView style={styles.quickActionsContainer}>
        <ThemedText type="subtitle">Quick Actions</ThemedText>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Ionicons name="search-outline" size={20} color="#fff" />
            <ThemedText style={styles.quickActionText}>Search Proteins</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => router.push('/(tabs)/favorites')}
          >
            <Ionicons name="bookmark-outline" size={20} color="#fff" />
            <ThemedText style={styles.quickActionText}>Favorites</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  githubHeaderImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userInfoContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userCard: {
    flexDirection: 'column',
    gap: 16,
  },
  userDetails: {
    flex: 1,
    gap: 8,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.8,
    color: '#fff',
  },
  authMethodContainer: {
    marginTop: 4,
  },
  authMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    alignSelf: 'flex-start',
  },
  authMethod: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  userBio: {
    fontSize: 13,
    opacity: 0.9,
    color: '#fff',
    fontStyle: 'italic',
    marginTop: 4,
  },
  userLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    opacity: 0.8,
    color: '#fff',
  },
  githubStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  githubStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    opacity: 0.7,
  },
  appInfoContainer: {
    gap: 12,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appTitleContainer: {
    flex: 1,
  },
  appTitle: {
    color: '#4A90E2',
    fontSize: 20,
    fontWeight: '600',
  },
  appSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    color: '#4A90E2',
  },
  appDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    gap: 8,
    minHeight: 120,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 16,
  },
  quickActionsContainer: {
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionItem: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  // GitHub Profile Information
  githubProfileContainer: {
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  githubProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  githubProfileTitle: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: '600',
  },
  githubProfileInfo: {
    gap: 12,
  },
  githubInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  githubInfoText: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  // GitHub Statistics
  githubStatsContainer: {
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  githubStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  githubStatCard: {
    flex: 1,
    minWidth: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    gap: 8,
  },
  githubStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A90E2',
  },
  githubStatLabel: {
    fontSize: 12,
    opacity: 0.8,
    color: '#fff',
    textAlign: 'center',
  },
  // Recent Repositories
  recentReposContainer: {
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reposList: {
    gap: 12,
  },
  repoItem: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  repoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  repoName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    flex: 1,
  },
  repoDescription: {
    fontSize: 12,
    opacity: 0.8,
    color: '#fff',
    lineHeight: 16,
  },
  repoStats: {
    flexDirection: 'row',
    gap: 16,
  },
  repoStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  repoStatText: {
    fontSize: 11,
    opacity: 0.7,
    color: '#fff',
  },
  // Organizations
  organizationsContainer: {
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  organizationsList: {
    gap: 12,
  },
  orgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  orgAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  orgInfo: {
    flex: 1,
    gap: 4,
  },
  orgName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  orgDescription: {
    fontSize: 12,
    opacity: 0.8,
    color: '#fff',
  },
  // Starred Repositories
  starredReposContainer: {
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  starredList: {
    gap: 12,
  },
  starredItem: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  starredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starredName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    flex: 1,
  },
  starredDescription: {
    fontSize: 12,
    opacity: 0.8,
    color: '#fff',
    lineHeight: 16,
  },
  starredStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  starredLanguage: {
    fontSize: 11,
    opacity: 0.7,
    color: '#fff',
  },
  starredStars: {
    fontSize: 11,
    opacity: 0.7,
    color: '#FFD700',
  },
  // GitHub Connection Prompt
  githubConnectionPrompt: {
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  githubPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  githubPromptTitle: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  githubPromptDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
    color: '#fff',
  },
  githubConnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
    alignSelf: 'flex-start',
  },
  githubConnectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
