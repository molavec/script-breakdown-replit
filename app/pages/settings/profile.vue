<script setup lang="ts">
import { ref } from 'vue'

const profile = ref({
  fullName: 'Alex Vance',
  email: 'alex.vance@scriptvisual.pro',
  role: 'Director',
  language: 'English (US)',
  biography: "Award-winning director focused on high-concept sci-fi and gripping thrillers. Currently in pre-production for 'Project Echo'."
})
</script>

<template>
  <div class="p-8 md:p-10 max-w-4xl">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-50 mb-2">Profile Settings</h1>
      <p class="text-gray-400 text-sm font-mono tracking-tight">Manage your personal information and professional identity.</p>
    </div>

    <div class="bg-[#2a2b31] rounded-lg p-6 border border-white/5 shadow-xl">
      <!-- Profile Picture -->
      <div class="flex items-center gap-6 mb-10">
        <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 shadow-inner shrink-0">
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" alt="Profile" class="w-full h-full object-cover" />
        </div>
        <div>
          <button class="bg-[#383941] hover:bg-[#464750] text-gray-200 px-4 py-2 rounded-md text-xs font-semibold transition-colors mb-2 shadow-sm border border-white/5">
            Change Picture
          </button>
          <p class="text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
        </div>
      </div>

      <!-- Form Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
        <div class="form-control">
          <label class="label px-0 pt-0 pb-2">
            <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Full Name</span>
          </label>
          <input type="text" v-model="profile.fullName" class="input input-bordered w-full bg-[#141414] border-black/50 text-gray-200 focus:border-white/20 focus:outline-none rounded-md" />
        </div>
        
        <div class="form-control">
          <label class="label px-0 pt-0 pb-2">
            <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Email Address</span>
          </label>
          <input type="email" v-model="profile.email" class="input input-bordered w-full bg-[#141414] border-black/50 text-gray-200 focus:border-white/20 focus:outline-none rounded-md" />
        </div>

        <div class="form-control">
          <label class="label px-0 pt-0 pb-2">
            <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Professional Role</span>
          </label>
          <select v-model="profile.role" class="select select-bordered w-full bg-[#141414] border-black/50 text-gray-200 focus:border-white/20 focus:outline-none rounded-md appearance-none">
            <option>Director</option>
            <option>Producer</option>
            <option>Writer</option>
            <option>Actor</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label px-0 pt-0 pb-2">
            <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Preferred Language</span>
          </label>
          <select v-model="profile.language" class="select select-bordered w-full bg-[#141414] border-black/50 text-gray-200 focus:border-white/20 focus:outline-none rounded-md appearance-none">
            <option>English (US)</option>
            <option>Spanish (ES)</option>
            <option>French (FR)</option>
          </select>
        </div>
      </div>

      <!-- Biography -->
      <div class="form-control mb-1">
        <label class="label px-0 pt-0 pb-2">
          <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Biography</span>
        </label>
        <textarea v-model="profile.biography" class="textarea textarea-bordered w-full bg-[#141414] border-black/50 text-gray-300 focus:border-white/20 focus:outline-none rounded-md h-28 resize-none leading-relaxed"></textarea>
      </div>
      <div class="text-right text-[11px] text-gray-500 mt-2">
        {{ profile.biography.length }} / 500 characters
      </div>
    </div>
  </div>
  
  <!-- Fixed Footer Actions -->
  <div class="max-w-4xl mx-8 md:mx-10 mt-6 flex items-center justify-between border-t border-white/5 pt-6 pb-12">
    <button class="text-xs font-semibold text-rose-500/80 hover:text-rose-400 transition-colors">
      Deactivate Account
    </button>
    
    <div class="flex items-center gap-3">
      <button class="px-5 py-2 rounded-md text-sm font-medium border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
        Cancel
      </button>
      <button class="bg-[#ff0033] hover:bg-[#e6002e] text-white px-5 py-2 rounded-md text-sm font-medium transition-colors shadow-lg shadow-red-500/20">
        Save Changes
      </button>
    </div>
  </div>
</template>
