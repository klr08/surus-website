// Script to clear team members from localStorage
// This will free up space to add new team members

// First, backup the current team members to a variable
const teamMembers = localStorage.getItem('surus_cms_team_members');
let teamData = [];
if (teamMembers) {
  try {
    teamData = JSON.parse(teamMembers);
    console.log(`Backed up ${teamData.length} team members to variable`);
  } catch (e) {
    console.error('Error parsing team members:', e);
  }
}

// Remove team members from localStorage to free up space
localStorage.removeItem('surus_cms_team_members');
console.log('Team members removed from localStorage');

// Create a download of the team data as a backup
if (teamData.length > 0) {
  const dataStr = JSON.stringify(teamData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'team-backup.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  console.log('Team data backup downloaded');
}

console.log('Storage cleared! You can now add new team members.');
console.log('Remember to publish to GitHub after adding team members to save them permanently.');
